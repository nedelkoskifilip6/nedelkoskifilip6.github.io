import { useState, useId, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { usePageScrollLock } from "./DemoDialog";

const assetBase = import.meta.env.BASE_URL.replace(/\/$/, "");
function BrandLogo({
  white = false,
  className = "",
}: {
  white?: boolean;
  className?: string;
}) {
  return (
    <img
      className={"revolut-logo " + className}
      src={`${assetBase}/brand/revolut-${white ? "white" : "black"}.svg`}
      alt="Revolut"
      width="110"
      height="28"
    />
  );
}


export function Navigation() {
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [onHero, setOnHero] = useState(true);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dropdownButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const navigationId = useId().replace(/:/g, "");
  usePageScrollLock(menu);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: "-20% 0px -65% 0px" });
    document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
    const hero = document.querySelector<HTMLElement>(".hero");
    const journey = hero?.closest<HTMLElement>(".cinematic-journey");
    const curtain = journey?.querySelector<HTMLElement>(".concept-strip");
    let frame = 0;
    let navHeight = header.current?.offsetHeight ?? 80;
    // The sticky photograph remains behind the banking curtain. Track the visible
    // handoff edge rather than the photograph's intersection with the viewport.
    const updateHeroContrast = () => {
      frame = 0;
      if (!hero) { setOnHero(false); return; }
      const cinematic = journey?.hasAttribute("data-cinematic") && curtain;
      const bounds = (cinematic ? curtain : hero).getBoundingClientRect();
      setOnHero(cinematic ? bounds.top > navHeight : bounds.bottom > navHeight);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateHeroContrast); };
    const onResize = () => {
      navHeight = header.current?.offsetHeight ?? 80;
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pageshow", schedule);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionPreference.addEventListener("change", schedule);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", schedule);
      motionPreference.removeEventListener("change", schedule);
    };
  }, []);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        setDrop("");
        setMenu(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (menu || drop)) {
        event.preventDefault();
        if (menu) menuButton.current?.focus();
        else dropdownButtons.current[drop]?.focus();
        setMenu(false);
        setDrop("");
      }
      if (event.key === "Tab" && menu && header.current) {
        const focusable = Array.from(header.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
          .filter(element => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menu, drop]);
  useEffect(() => {
    if (!menu) return;
    header.current?.querySelector<HTMLElement>(".nav-links button, .nav-links a")?.focus({ preventScroll: true });
  }, [menu]);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 800px)");
    const resized = () => { if (!mobile.matches) { setMenu(false); setDrop(""); } };
    mobile.addEventListener("change", resized);
    return () => mobile.removeEventListener("change", resized);
  }, []);
  const closeNavigation = () => { setDrop(""); setMenu(false); };
  return (
    <header ref={header} className="nav" data-on-hero={onHero && !menu} data-menu-open={menu}>
      <a className="brand" href="#" aria-label="Portfolio concept home" onClick={closeNavigation}>
        <BrandLogo white={onHero && !menu} />
      </a>
      <nav
        id={navigationId}
        aria-label="Main navigation"
        className={menu ? "nav-links open" : "nav-links"}
      >
        {["Personal", "Business", "Features"].map((x) => (
          <div className="nav-item" key={x} onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setDrop(current => current === x ? "" : current);
            }
          }}>
            <button
              ref={element => { dropdownButtons.current[x] = element; }}
              aria-expanded={drop === x}
              aria-controls={navigationId + "-" + x.toLowerCase()}
              data-active={x === "Personal" && ["banking", "payments", "cards", "savings", "invest"].includes(activeSection)}
              onClick={() => setDrop(drop === x ? "" : x)}
            >
              {x}
            </button>
            {drop === x && (
              <div className="dropdown" id={navigationId + "-" + x.toLowerCase()}>
                {(x === "Business"
                  ? [
                      ["Global business demo", "payments"],
                      ["Team spending demo", "banking"],
                    ]
                  : [
                      ["Everyday banking", "banking"],
                      ["Global payments", "payments"],
                      ["Cards & savings", "cards"],
                      ["Investments", "invest"],
                    ]
                ).map(([t, id]) => (
                  <a key={id} href={"#" + id} onClick={closeNavigation}>{t}</a>
                ))}
              </div>
            )}
          </div>
        ))}
        {[
          ["Plans", "plans"],
          ["Security", "security"],
        ].map(([t, id]) => (
          <a key={id} href={"#" + id} aria-current={activeSection === id ? "location" : undefined} onClick={closeNavigation}>
            {t}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button
          className="login"
          onClick={() => {
            closeNavigation();
            window.dispatchEvent(new CustomEvent("orbit-demo", { detail: "Welcome to your demo account" }));
          }}
        >Demo account</button>
        <a className="button small" href="#banking" onClick={closeNavigation}>Explore demo</a>
        <button
          ref={menuButton}
          className="menu"
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-controls={navigationId}
          aria-expanded={menu}
          onClick={() => { setMenu(!menu); setDrop(""); }}
        >{menu ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

