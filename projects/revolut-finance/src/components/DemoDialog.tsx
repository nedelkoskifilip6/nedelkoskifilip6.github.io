import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

// Shared by navigation and dialogs so overlapping overlays cannot unlock the page.
let scrollLocks = 0;
let originalOverflow = "";
let originalPadding = "";
export function usePageScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (scrollLocks++ === 0) {
      originalOverflow = document.body.style.overflow;
      originalPadding = document.body.style.paddingRight;
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      if (gutter > 0) {
        document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gutter}px`;
      }
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--scrollLocks === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPadding;
      }
    };
  }, [locked]);
}

/** Keep dialog focus contained and return it to the trigger, or a chosen section. */
export function useDialogLifecycle(open: boolean) {
  const dialog = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  usePageScrollLock(open);
  const captureOpener = (element?: HTMLElement | null) => {
    returnFocus.current = element ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  };
  const focusSectionOnClose = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      if (!section.hasAttribute("tabindex")) section.tabIndex = -1;
      returnFocus.current = section;
    }
  };
  useEffect(() => {
    if (!open) return;
    const focusFirst = () => dialog.current?.querySelector<HTMLElement>("button, a[href], input, select")?.focus({ preventScroll: true });
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.current?.contains(event.target)) focusFirst();
    };
    focusFirst();
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("focusin", containFocus);
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    };
  }, [open]);
  return { dialog, captureOpener, focusSectionOnClose };
}

export function DemoDialog() {
  const [title, setTitle] = useState("");
  const { dialog, captureOpener, focusSectionOnClose } = useDialogLifecycle(Boolean(title));
  useEffect(() => {
    const handler = (e: Event) => {
      const active = document.activeElement;
      captureOpener(document.querySelector<HTMLElement>(".nav-actions .login") ?? (active instanceof HTMLElement && active !== document.body ? active : null));
      setTitle((e as CustomEvent<string>).detail);
    };
    window.addEventListener("orbit-demo", handler);
    return () => window.removeEventListener("orbit-demo", handler);
  }, []);
  return title ? (
    <div className="modal-backdrop" onClick={() => setTitle("")}>
      <div
        ref={dialog}
        className="demo-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Demo account"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          autoFocus
          className="close-modal"
          aria-label="Close demo"
          onClick={() => setTitle("")}
        >
          <X />
        </button>
        <span className="label">INDEPENDENT PORTFOLIO CONCEPT</span>
        <h3>{title}</h3>
        <p>
          Your demo is ready. All balances, cards and transactions are
          fictional. No authentication or personal information is needed.
        </p>
        <a className="button" href="#banking" onClick={() => { focusSectionOnClose("banking"); setTitle(""); }}>
          Enter the experience 
        </a>
      </div>
    </div>
  ) : null;
}
