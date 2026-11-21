import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { profile } from "../models/Profile";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SectionSpy } from "../lib/SectionSpy";
import { SectionNavigator } from "../lib/SectionNavigator";

const links = [
  { id: "services", label: "Services" },
  { id: "journey", label: "Journey" },
  { id: "onsite", label: "On Site" },
  { id: "companies", label: "Companies" },
  { id: "awards", label: "Awards" },
  { id: "contact", label: "Contact" },
];

const sectionIds = new Set([
  "home",
  ...links.map((link) => link.id),
]);

export function Nav() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationSequence = useRef(0);

  const getNavHeight = useCallback(
    (): number => headerRef.current?.getBoundingClientRect().height ?? 64,
    [],
  );

  const navigateTo = useCallback(
    (id: string, smooth: boolean): void => {
      if (!sectionIds.has(id)) return;

      navigationSequence.current += 1;
      const sequence = navigationSequence.current;

      setActiveSection(id);
      setMenuOpen(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (sequence !== navigationSequence.current) return;

          if (smooth) {
            void SectionNavigator.scrollTo(id, getNavHeight());
          } else {
            SectionNavigator.alignTarget(id, getNavHeight());
          }
        });
      });
    },
    [getNavHeight],
  );

  useEffect(() => {
    const spy = new SectionSpy(setActiveSection);
    return () => spy.disconnect();
  }, []);

  useEffect(() => {
    const updateScrollState = (): void => {
      setScrolled(window.scrollY > 20);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const initialHash = window.location.hash.slice(1);
    if (!initialHash || !sectionIds.has(initialHash)) return;

    let cancelled = false;
    let pinSequence = 0;

    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const alignInitialHash = async (): Promise<void> => {
      await SectionNavigator.waitForPageAssets();
      if (cancelled) return;

      const sequence = ++pinSequence;
      await SectionNavigator.pinHashTarget(initialHash, getNavHeight);

      if (cancelled || sequence !== pinSequence) return;
    };

    void alignInitialHash();

    const handleHashChange = (): void => {
      const id = window.location.hash.slice(1);
      if (!sectionIds.has(id)) return;

      pinSequence += 1;
      navigateTo(id, true);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [getNavHeight, navigateTo]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ): void => {
    event.preventDefault();

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }

    navigateTo(id, true);
  };

  const closeMenu = (): void => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-bg/95 shadow-lg backdrop-blur-md"
          : "border-transparent bg-bg/65 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#home"
          onClick={(event) => handleLinkClick(event, "home")}
          className="min-w-0 font-display text-xl font-bold uppercase tracking-wide text-fg transition-colors hover:text-accent sm:text-2xl"
        >
          {profile.person.name}
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => handleLinkClick(event, link.id)}
              aria-current={activeSection === link.id ? "location" : undefined}
              className={`relative py-2 font-mono text-[10px] uppercase tracking-[0.13em] transition-colors after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-accent ${
                activeSection === link.id
                  ? "text-accent after:scale-x-100"
                  : "text-muted"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ThemeSwitcher />
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="flex h-10 w-10 items-center justify-center border border-line text-fg transition-colors hover:border-accent hover:text-accent lg:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <section
        ref={panelRef}
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col overflow-y-auto border-l border-line bg-bg px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl transition-transform duration-300 min-[380px]:w-full lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Navigation
            </p>
            <p className="mt-1 font-display text-lg font-bold uppercase text-fg">
              {profile.person.name}
            </p>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <X size={21} />
          </button>
        </div>

        <nav aria-label="Mobile main navigation" className="flex flex-1 flex-col">
          {links.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => handleLinkClick(event, link.id)}
              aria-current={activeSection === link.id ? "location" : undefined}
              className={`flex items-center justify-between border-b border-line py-4 font-display text-2xl font-semibold uppercase tracking-wide transition-colors hover:text-accent ${
                activeSection === link.id ? "text-accent" : "text-fg"
              }`}
            >
              <span>{link.label}</span>
              <span className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-6 max-w-full border-t border-line pt-6 [&_*]:max-w-full">
          <ThemeSwitcher />
        </div>
      </section>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-default bg-bg/70 backdrop-blur-sm lg:hidden"
        />
      )}
    </header>
  );
}
