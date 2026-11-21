import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, ChevronDown, ChevronUp, HardHat, MapPin, Wrench } from "lucide-react";
import { Section } from "../components/ui/Section";
import { Chip } from "../components/ui/Chip";
import { profile } from "../models/Profile";
import { JourneyFilter, type ExperienceTypeFilter } from "../models/JourneyFilter";
import { initials, slug } from "../lib/text";
import type { Experience } from "../models/Experience";

gsap.registerPlugin(ScrollTrigger);

const TYPE_TABS: { value: ExperienceTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "project", label: "Projects" },
  { value: "turnaround", label: "Turnarounds" },
];

function CompanyBadge({ company, logoUrl }: { company: string; logoUrl?: string }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-bg font-display text-base font-bold uppercase tracking-tight text-accent"
      >
        {initials(company, 3)}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={company}
      onError={() => setFailed(true)}
      className="h-9 w-9 shrink-0 border border-line bg-bg object-contain p-1"
    />
  );
}

type Segment =
  | { kind: "regular"; items: Experience[] }
  | { kind: "employer"; item: Experience };

export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pipelineTrackRef = useRef<HTMLDivElement>(null);
  const pipelineFillRef = useRef<HTMLDivElement>(null);

  const [typeFilter, setTypeFilter] = useState<ExperienceTypeFilter>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [expandedEmployer, setExpandedEmployer] = useState<boolean>(false);
  const subProjectsRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => JourneyFilter.countries(profile.experiences), []);

  const decadeGroups = useMemo(() => {
    const filter = new JourneyFilter(typeFilter, countryFilter);
    return profile
      .decades()
      .map((d) => ({
        label: d.label,
        items: filter.apply(d.items),
      }))
      .filter((d) => d.items.length > 0);
  }, [typeFilter, countryFilter]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        if (pipelineFillRef.current) {
          gsap.set(pipelineFillRef.current, { scaleY: 1 });
        }
        gsap.set(".journey-card", { opacity: 1, x: 0, y: 0, clipPath: "inset(0 0 0% 0)" });
        return;
      }

      if (pipelineTrackRef.current && pipelineFillRef.current) {
        gsap.fromTo(
          pipelineFillRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: pipelineTrackRef.current,
              start: "top 65%",
              end: "bottom 75%",
              scrub: 0.4,
            },
          }
        );
      }

      gsap.utils.toArray<HTMLElement>(".decade-heading").forEach((el) => {
        gsap.fromTo(
          el,
          { x: -16 },
          {
            x: 0,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              once: true,
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".journey-card").forEach((card) => {
        const side = card.dataset.side;
        const startX = window.innerWidth >= 1024 ? (side === "left" ? -14 : side === "right" ? 14 : 0) : 0;
        gsap.fromTo(
          card,
          {
            y: 16,
            x: startX,
            clipPath: "inset(0 0 6% 0)",
            opacity: 1,
          },
          {
            y: 0,
            x: 0,
            clipPath: "inset(0 0 0% 0)",
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 95%",
              once: true,
            },
          }
        );
      });
    }, containerRef);

    const refreshAll = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refreshAll);
    window.addEventListener("load", refreshAll);

    return () => {
      window.removeEventListener("load", refreshAll);
      ctx.revert();
    };
  }, [decadeGroups]);

  const toggleSubProjects = () => {
    const el = subProjectsRef.current;
    const next = !expandedEmployer;
    setExpandedEmployer(next);

    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (next) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 1 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => ScrollTrigger.refresh(),
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => ScrollTrigger.refresh(),
      });
    }
  };

  const renderTypeChip = (exp: Experience) => {
    if (exp.type === "turnaround" || exp.isTurnaround) {
      return <Chip icon={Wrench} label="Turnaround" tone="accent" />;
    }
    if (exp.type === "employer") {
      return <Chip icon={Building2} label="Employer" tone="accent" />;
    }
    return <Chip icon={HardHat} label="Project" tone="muted" />;
  };

  const getCompanyLogoUrl = (exp: Experience): string | undefined => {
    const raw = exp as Experience & { logo?: string; companyLogo?: string };
    return raw.logo ?? raw.companyLogo ?? `/logos/${slug(exp.company)}.png`;
  };

  const renderRegularCard = (exp: Experience, side: "left" | "right" | "mobile") => (
    <div className="relative flex items-start pl-10 lg:pl-0">
      {/* Flange Node on Pipe */}
      <span
        aria-hidden="true"
        className={`absolute top-5 z-10 h-3.5 w-3.5 rotate-45 border-2 border-accent bg-bg ${
          side === "mobile"
            ? "left-4 -translate-x-1/2"
            : side === "left"
              ? "-right-7 translate-x-1/2"
              : "-left-7 -translate-x-1/2"
        }`}
      />

      {/* Horizontal Pipe Branch */}
      <span
        aria-hidden="true"
        className={`absolute top-[26px] h-0.5 bg-line ${
          side === "mobile"
            ? "left-4 w-6"
            : side === "left"
              ? "-right-7 w-7"
              : "-left-7 w-7"
        }`}
      />

      <article
        data-side={side}
        className="journey-card relative z-10 w-full border border-line bg-surface p-4 opacity-100 transition-colors hover:border-accent/60 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-semibold text-accent">{exp.periodLabel}</span>
            {exp.endDate !== null && (
              <span className="text-muted">· {exp.durationMonths} mos</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip icon={MapPin} label={exp.country} tone="muted" />
            {renderTypeChip(exp)}
          </div>
        </div>

        <div className="mt-2.5 flex items-start gap-3">
          <CompanyBadge company={exp.company} logoUrl={getCompanyLogoUrl(exp)} />
          <div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-fg sm:text-2xl">
              {exp.role}
            </h3>
            <div className="mt-0.5 font-sans text-sm font-semibold text-fg">
              {exp.company}
            </div>
          </div>
        </div>

        <div className="mt-1.5 space-y-0.5 font-mono text-xs text-muted">
          {exp.project && (
            <div>
              <span className="text-fg/80">Project:</span> {exp.project}
            </div>
          )}
          {exp.client && (
            <div>
              <span className="text-fg/80">Client:</span> {exp.client}
            </div>
          )}
        </div>

        {exp.duties && (
          <p className="mt-2.5 border-t border-line/70 pt-2 font-sans text-xs leading-relaxed text-muted sm:text-sm">
            {exp.duties}
          </p>
        )}
      </article>
    </div>
  );

  const renderEmployerCard = (exp: Experience) => (
    <article
      data-side="full"
      className="journey-card relative z-20 ml-10 border-2 border-accent/60 bg-surface p-5 opacity-100 shadow-xs sm:p-6 lg:mx-auto lg:w-full lg:max-w-4xl"
    >
      {/* Pipe Tap Connector on Mobile */}
      <span
        aria-hidden="true"
        className="absolute top-7 -left-6 h-0.5 w-6 bg-accent lg:hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
            {exp.periodLabel}
          </span>
          {exp.endDate !== null && (
            <span className="font-mono text-[11px] text-muted">
              ({exp.durationMonths} mos)
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip icon={MapPin} label={exp.country} tone="muted" />
          {renderTypeChip(exp)}
        </div>
      </div>

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3">
          <CompanyBadge company={exp.company} logoUrl={getCompanyLogoUrl(exp)} />
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-fg">
              {exp.role}
            </h3>
            <p className="mt-0.5 font-sans text-sm font-semibold text-fg">
              {exp.company}
              {exp.project ? ` — ${exp.project}` : ""}
            </p>
            {exp.client && (
              <p className="font-mono text-xs text-muted">
                Client: {exp.client}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSubProjects}
          aria-expanded={expandedEmployer}
          className="inline-flex shrink-0 items-center gap-2 border border-accent bg-accent/10 px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-on-accent"
        >
          <span>{exp.subProjects.length} projects</span>
          {expandedEmployer ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {exp.duties && (
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
          {exp.duties}
        </p>
      )}

      {/* Expandable Sub-Projects Grid */}
      <div
        ref={subProjectsRef}
        className={`overflow-hidden ${expandedEmployer ? "h-auto" : "h-0"}`}
      >
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {exp.subProjects.map((sub, sIdx) => (
            <div
              key={`${sub.project}-${sIdx}`}
              className="border border-line bg-bg p-3 text-left"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                #{String(sIdx + 1).padStart(2, "0")} · {sub.role}
              </div>
              <div className="mt-1 font-sans text-xs font-semibold text-fg">
                {sub.project}
              </div>
              <div className="mt-2 space-y-0.5 border-t border-line/60 pt-1.5 font-mono text-[10px] text-muted">
                <div>Client: {sub.client}</div>
                <div>End User: {sub.endUser}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );

  return (
    <Section id="journey" eyebrow="CAREER HISTORY 1998 - 2026" title="The Journey">
      <div ref={containerRef} className="relative">
        {/* Sticky Filter Bar: single horizontal scroll strip on < md, full wrap on md+ */}
        <div className="sticky top-16 z-30 mb-8 border border-line bg-surface/95 px-2.5 py-1.5 backdrop-blur-xs md:p-3">
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:justify-between md:gap-3 md:overflow-visible">
            {/* Type Filters */}
            <div className="flex shrink-0 items-center gap-1.5 md:flex-wrap">
              {TYPE_TABS.map((tab) => {
                const active = typeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setTypeFilter(tab.value)}
                    className={`shrink-0 snap-start px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors md:px-3 md:py-1.5 md:text-xs ${
                      active
                        ? "bg-accent text-on-accent font-semibold"
                        : "border border-line bg-bg text-muted hover:border-accent hover:text-fg"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Divider between Type and Country chips */}
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line md:hidden" />

            {/* Country Filters */}
            <div className="flex shrink-0 items-center gap-1.5 md:flex-wrap">
              <button
                type="button"
                onClick={() => setCountryFilter("all")}
                className={`inline-flex shrink-0 snap-start items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors md:px-2.5 md:text-[11px] ${
                  countryFilter === "all"
                    ? "border border-accent bg-accent/15 text-accent font-semibold"
                    : "border border-line bg-bg text-muted hover:text-fg"
                }`}
              >
                <MapPin className="h-3 w-3" />
                All Countries
              </button>
              {countries.map((c) => {
                const active = countryFilter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountryFilter(active ? "all" : c)}
                    className={`inline-flex shrink-0 snap-start items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors md:px-2.5 md:text-[11px] ${
                      active
                        ? "border border-accent bg-accent/15 text-accent font-semibold"
                        : "border border-line bg-bg text-muted hover:text-fg"
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty Filter State */}
        {decadeGroups.length === 0 && (
          <div className="border border-line bg-surface p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              No assignments match the selected filter combination.
            </p>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setCountryFilter("all");
              }}
              className="mt-4 bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest text-on-accent"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pipeline Timeline Container */}
        {decadeGroups.length > 0 && (
          <div ref={pipelineTrackRef} className="relative pb-6">
            {/* Vertical Pipe Track (Left on mobile, Center on desktop) */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-4 w-2 -translate-x-1/2 border-x border-line bg-surface lg:left-1/2"
            >
              <div
                ref={pipelineFillRef}
                className="h-full w-full bg-accent will-change-transform"
              />
            </div>

            <div className="space-y-12">
              {decadeGroups.map((decade) => {
                const segments: Segment[] = [];
                for (const exp of decade.items) {
                  const isEmployer = exp.type === "employer" && exp.subProjects.length > 0;
                  if (isEmployer) {
                    segments.push({ kind: "employer", item: exp });
                  } else {
                    const last = segments[segments.length - 1];
                    if (last && last.kind === "regular") {
                      last.items.push(exp);
                    } else {
                      segments.push({ kind: "regular", items: [exp] });
                    }
                  }
                }

                return (
                  <div key={decade.label} className="relative">
                    {/* Decade Header + Flange Ring */}
                    <div className="decade-heading relative mb-6 flex items-center gap-4 pl-12 lg:justify-center lg:pl-0">
                      {/* Flange Ring on Pipe */}
                      <span
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 h-5 w-7 -translate-x-1/2 -translate-y-1/2 border-2 border-accent bg-bg lg:left-1/2"
                      />
                      <div className="relative z-10 flex flex-wrap items-baseline gap-3 border border-line bg-bg px-4 py-1.5">
                        <span
                          className="font-display text-4xl font-bold uppercase tracking-tight text-transparent sm:text-5xl"
                          style={{ WebkitTextStroke: "1.5px var(--accent)" }}
                        >
                          {decade.label}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-widest text-muted">
                          {decade.items.length}{" "}
                          {decade.items.length === 1 ? "assignment" : "assignments"}
                        </span>
                      </div>
                    </div>

                    {/* Segments */}
                    <div className="space-y-6">
                      {segments.map((seg, segIdx) => {
                        if (seg.kind === "employer") {
                          return (
                            <div
                              key={`${decade.label}-emp-${seg.item.company}-${segIdx}`}
                            >
                              {renderEmployerCard(seg.item)}
                            </div>
                          );
                        }

                        const leftItems = seg.items.filter((_, i) => i % 2 === 0);
                        const rightItems = seg.items.filter((_, i) => i % 2 === 1);

                        return (
                          <div key={`${decade.label}-seg-${segIdx}`}>
                            {/* Mobile Single Column */}
                            <div className="flex flex-col gap-5 lg:hidden">
                              {seg.items.map((exp, i) => (
                                <div
                                  key={`${decade.label}-m-${exp.company}-${exp.periodLabel}-${i}`}
                                >
                                  {renderRegularCard(exp, "mobile")}
                                </div>
                              ))}
                            </div>

                            {/* Desktop Two Independent Offset Columns */}
                            <div className="hidden lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-14">
                              <div className="flex flex-col gap-6">
                                {leftItems.map((exp, i) => (
                                  <div
                                    key={`${decade.label}-l-${exp.company}-${exp.periodLabel}-${i}`}
                                  >
                                    {renderRegularCard(exp, "left")}
                                  </div>
                                ))}
                              </div>

                              <div
                                className={`flex flex-col gap-6 ${
                                  rightItems.length > 0 ? "mt-[120px]" : ""
                                }`}
                              >
                                {rightItems.map((exp, i) => (
                                  <div
                                    key={`${decade.label}-r-${exp.company}-${exp.periodLabel}-${i}`}
                                  >
                                    {renderRegularCard(exp, "right")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
