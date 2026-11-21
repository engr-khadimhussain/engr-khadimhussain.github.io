import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Section } from "../components/ui/Section";
import { CompanyLogo } from "../components/ui/CompanyLogo";
import { companyDirectory } from "../models/CompanyDirectory";

type DirectoryFilter = "all" | "employers" | "clients";

const filters: { id: DirectoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "employers", label: "Employers" },
  { id: "clients", label: "Clients" },
];

export function Companies() {
  const [filter, setFilter] = useState<DirectoryFilter>("all");
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );
  const directoryHeadingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const organisations = useMemo(() => {
    if (filter === "employers") return companyDirectory.employers();
    if (filter === "clients") return companyDirectory.clients();
    return companyDirectory.all();
  }, [filter]);

  const visibleLimit = isDesktop ? 12 : 9;
  const displayedOrganisations = expanded
    ? organisations
    : organisations.slice(0, visibleLimit);
  const hasMore = organisations.length > visibleLimit;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = (): void => setIsDesktop(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [filter]);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const previousHeight = container.getBoundingClientRect().height;

    animationRef.current?.kill();

    if (expanded) {
      gsap.set(container, { height: previousHeight, overflow: "hidden" });
      gsap.set(container, { height: "auto" });
      const fullHeight = container.getBoundingClientRect().height;
      gsap.set(container, { height: previousHeight });

      animationRef.current = gsap.to(container, {
        height: fullHeight,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(container, { height: "auto", overflow: "visible" });
        },
      });
    } else {
      gsap.set(container, { overflow: "hidden" });
      animationRef.current = gsap.to(container, {
        height: container.scrollHeight,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(container, { height: "auto", overflow: "visible" });
        },
      });

      if (children.length > 0) {
        requestAnimationFrame(() => {
          directoryHeadingRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    }

    return () => {
      animationRef.current?.kill();
    };
  }, [expanded, displayedOrganisations.length]);

  const marqueeOrganisations = companyDirectory.all();

  return (
    <Section id="companies" eyebrow="PROJECT NETWORK" title="Companies">
      <div className="mb-12 overflow-hidden border-y border-line py-5">
        <div className="flex w-max animate-[company-marquee_55s_linear_infinite] items-center gap-10">
          {[...marqueeOrganisations, ...marqueeOrganisations].map(
            (organisation, index) => (
              <div
                key={`${organisation.name}-${index}`}
                className="group relative flex items-center gap-3"
                title={organisation.name}
              >
                <CompanyLogo name={organisation.name} size="sm" />
                <span className="max-w-40 truncate font-mono text-[10px] uppercase tracking-wider text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  {organisation.name}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="border border-line bg-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Organisations
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-fg">
            {companyDirectory.all().length}
          </p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Employers
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-fg">
            {companyDirectory.employers().length}
          </p>
        </div>
        <div className="col-span-2 border border-line bg-surface p-4 md:col-span-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Clients
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-fg">
            {companyDirectory.clients().length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            Reference register
          </p>
          <h3
            ref={directoryHeadingRef}
            className="mt-1 scroll-mt-20 font-display text-2xl font-bold uppercase text-fg"
          >
            Organisation Directory
          </h3>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter organisations"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filter === item.id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={cardsRef}
        className="grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-3"
      >
        {displayedOrganisations.map((organisation) => {
          const yearRange =
            organisation.firstYear === organisation.lastYear
              ? String(organisation.firstYear)
              : `${organisation.firstYear} — ${organisation.lastYear}`;

          return (
            <article
              key={`${organisation.kind}-${organisation.name}`}
              className="flex min-w-0 items-center gap-4 border border-line bg-surface p-4 transition-colors duration-300 hover:border-accent"
            >
              <CompanyLogo name={organisation.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-display text-lg font-bold uppercase tracking-wide text-fg">
                  {organisation.name}
                </h4>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {organisation.kind === "employer" ? "Employer" : "Client"}
                  {" · "}
                  {organisation.count}{" "}
                  {organisation.count === 1 ? "assignment" : "assignments"}
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted">
                  {yearRange}
                </p>
                {organisation.countries.length > 0 && (
                  <p className="mt-1 truncate text-xs text-muted">
                    {organisation.countries.join(" · ")}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="border border-line px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {expanded
              ? "Show fewer organisations"
              : `Show all ${organisations.length} organisations`}
          </button>
        </div>
      )}
    </Section>
  );
}
