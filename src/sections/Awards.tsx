import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, ExternalLink, Medal, ShieldCheck } from "lucide-react";
import { Section } from "../components/ui/Section";
import { Chip } from "../components/ui/Chip";
import { Lightbox } from "../components/Lightbox";
import { profile } from "../models/Profile";
import { AwardsOrganizer, type AwardEntry } from "../models/AwardsOrganizer";

gsap.registerPlugin(ScrollTrigger);

function AwardIssuerPlate({ logo, issuer }: { logo?: string; issuer: string }) {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <div className="flex h-11 min-w-14 items-center justify-center border border-line bg-plate px-2.5 font-display text-sm font-bold uppercase tracking-wider text-plate-ink">
        {issuer.slice(0, 4)}
      </div>
    );
  }

  return (
    <div className="flex h-11 min-w-14 items-center justify-center border border-line bg-plate px-2.5 py-1.5">
      <img
        src={`/logos/${logo}.png`}
        alt={issuer}
        onError={() => setFailed(true)}
        className="max-h-full max-w-24 object-contain"
      />
    </div>
  );
}

function AwardRosette({ index }: { index: number }) {
  const Icon = index % 3 === 0 ? Award : index % 3 === 1 ? ShieldCheck : Medal;

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="award-rosette absolute inset-0 h-full w-full text-accent"
      >
        <polygon
          points="32,2 38,8 46,6 49,14 58,16 57,25 63,31 58,38 60,47 52,50 50,59 41,58 36,64 28,64 23,58 14,59 12,50 4,47 6,38 1,31 7,25 6,16 15,14 18,6 26,8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle
          cx="32"
          cy="32"
          r="21"
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
      <Icon className="relative z-10 h-4 w-4 text-accent" />
    </div>
  );
}

export function Awards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const rawAwards = (profile.awards ?? []) as unknown as readonly AwardEntry[];
  const organizer = useMemo(() => new AwardsOrganizer(rawAwards), [rawAwards]);
  const orderedAwards = useMemo(() => organizer.sorted(), [organizer]);
  const summary = useMemo(() => organizer.summary(), [organizer]);
  const lightboxItems = useMemo(
    () => organizer.toLightboxItems(orderedAwards),
    [organizer, orderedAwards]
  );

  const scanIndexByAward = useMemo(() => {
    const map = new Map<AwardEntry, number>();
    let counter = 0;
    for (const item of orderedAwards) {
      if (item.scan) {
        map.set(item, counter);
        counter += 1;
      }
    }
    return map;
  }, [orderedAwards]);

  const featuredAwards = orderedAwards.slice(0, 2);
  const remainingAwards = orderedAwards.slice(2);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(".award-card", { y: 0 });
        gsap.set(".award-rosette", { rotation: 0 });
        return;
      }

      gsap.fromTo(
        ".award-card",
        { y: 18 },
        {
          y: 0,
          duration: 0.5,
          stagger: { amount: 0.4, from: "start" },
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".award-rosette",
        { rotation: -75 },
        {
          rotation: 0,
          duration: 0.75,
          stagger: { amount: 0.45, from: "start" },
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [orderedAwards.length]);

  const renderCard = (award: AwardEntry, idx: number, featured = false) => {
    const scanIdx = scanIndexByAward.get(award);
    const displayYear = award.yearLabel || (award.year !== null ? String(award.year) : "HONOUR");

    return (
      <div
        key={`${award.title}-${award.issuer}-${idx}`}
        className="group/stack relative pt-2 pr-2"
      >
        {/* Certificate Scan Thumbnail Behind Card */}
        {award.scan && scanIdx !== undefined && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1 right-0 z-0 h-28 w-40 -rotate-4 border border-line bg-surface p-1 shadow-md transition-all duration-300 ease-out group-hover/stack:-translate-y-2 group-hover/stack:translate-x-2 group-hover/stack:rotate-0 sm:h-32 sm:w-44"
          >
            <img
              src={award.scan}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-85"
            />
          </div>
        )}

        <article
          className={`award-card relative z-10 flex h-full flex-col justify-between border border-line bg-surface transition-colors hover:border-accent/70 ${
            featured ? "p-6 sm:p-7" : "p-5"
          }`}
        >
          <div>
            {/* Top Row: Plate + Rosette + Outlined Year */}
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <AwardIssuerPlate logo={award.logo} issuer={award.issuer} />
                <AwardRosette index={idx} />
              </div>

              <span
                className={`font-display font-bold leading-none tracking-tight text-transparent select-none ${
                  featured ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
                }`}
                style={{ WebkitTextStroke: "1.25px var(--accent)" }}
              >
                {displayYear}
              </span>
            </div>

            {/* Award Title & Issuer */}
            <h3
              className={`mt-4 font-display font-bold uppercase tracking-wide text-fg ${
                featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              }`}
            >
              {award.title}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                {award.issuer}
              </span>
              {award.role && <Chip label={award.role} tone="muted" />}
            </div>

            {/* Context Copy */}
            {award.context && (
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                {award.context}
              </p>
            )}
          </div>

          {/* Action Footer */}
          {award.scan && scanIdx !== undefined && (
            <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-3.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Original certificate on file
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(scanIdx)}
                className="inline-flex items-center gap-1.5 border border-line bg-bg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-fg transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
              >
                <span>View original certificate</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </article>
      </div>
    );
  };

  return (
    <Section
      id="awards"
      eyebrow="RECOGNISED FOR SAFETY & DELIVERY"
      title="Awards & Recognitions"
    >
      <div ref={containerRef} className="space-y-8">
        {/* Counter Strip */}
        <div className="grid grid-cols-3 divide-x divide-line border border-line bg-surface">
          <div className="px-4 py-3.5 sm:px-6">
            <div className="font-display text-3xl font-bold leading-none text-fg sm:text-4xl">
              {summary.total}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              Total Awards
            </div>
          </div>
          <div className="px-4 py-3.5 sm:px-6">
            <div className="font-display text-3xl font-bold leading-none text-accent sm:text-4xl">
              {summary.issuers}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              Issuing Bodies
            </div>
          </div>
          <div className="px-4 py-3.5 sm:px-6">
            <div className="font-display text-2xl font-bold leading-none text-fg sm:text-3xl">
              {summary.spanLabel}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              Years Span
            </div>
          </div>
        </div>

        {/* Featured 2 Most Recent Awards */}
        {featuredAwards.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {featuredAwards.map((award, idx) => renderCard(award, idx, true))}
          </div>
        )}

        {/* Remaining Awards Grid */}
        {remainingAwards.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {remainingAwards.map((award, idx) => renderCard(award, idx + 2, false))}
          </div>
        )}
      </div>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(next) => setLightboxIndex(next)}
      />
    </Section>
  );
}
