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
  const [selectedSection, setSelectedSection] = useState("");
  const [onHero, setOnHero] = useState(true);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigationId = useId().replace(/:/g, "");
  usePageScrollLock(menu);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const journey = hero?.closest<HTMLElement>(".cinematic-journey");
    const curtain = journey?.querySelector<HTMLElement>(".concept-strip");
    let frame = 0;
    let navHeight = header.current?.offsetHeight ?? 80;
    // The sticky photograph remains behind the content curtain. Track the visible
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
        setMenu(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu) {
        event.preventDefault();
        menuButton.current?.focus();
        setMenu(false);
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
  }, [menu]);
  useEffect(() => {
    if (!menu) return;
    header.current?.querySelector<HTMLElement>(".nav-links a")?.focus({ preventScroll: true });
  }, [menu]);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 800px)");
    const resized = () => { if (!mobile.matches) setMenu(false); };
    mobile.addEventListener("change", resized);
    return () => mobile.removeEventListener("change", resized);
  }, []);
  const closeNavigation = () => { setMenu(false); };
  return (
    <header ref={header} className="nav" data-on-hero={onHero && !menu} data-menu-open={menu}>
      <a className="brand" href="#" aria-label="Portfolio concept home" onClick={() => { setSelectedSection(""); closeNavigation(); }}>
        <BrandLogo white={onHero && !menu} />
      </a>
      <nav
        id={navigationId}
        aria-label="Main navigation"
        className={menu ? "nav-links open" : "nav-links"}
      >
        {[
          ["Savings", "savings"],
          ["Security", "security"],
          ["Investments", "invest"],
          ["Plans", "plans"],
        ].map(([t, id]) => (
          <a key={id} href={"#" + id} aria-current={selectedSection === id ? "location" : undefined} onClick={() => { setSelectedSection(id); closeNavigation(); }}>
            {t}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <a className="explore-demo" href="#savings" onClick={closeNavigation}>Explore demo</a>
        <button
          ref={menuButton}
          className="menu"
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-controls={navigationId}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >{menu ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

