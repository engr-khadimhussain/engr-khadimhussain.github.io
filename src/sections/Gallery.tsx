import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin } from "lucide-react";
import { Section } from "../components/ui/Section";
import { Lightbox } from "../components/Lightbox";
import { profile } from "../models/Profile";

gsap.registerPlugin(ScrollTrigger);

export function Gallery() {
  const sectionContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const photos = profile.gallery;

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(".gallery-tile", { opacity: 1, y: 0 });
        return;
      }

      gsap.from(".gallery-tile", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: { amount: 0.55, from: "start" },
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionContainerRef.current,
          start: "top 86%",
          once: true,
        },
      });
    }, sectionContainerRef);

    return () => ctx.revert();
  }, [photos.length]);

  return (
    <Section id="onsite" eyebrow="FROM THE FIELD" title="On Site">
      <div ref={sectionContainerRef}>
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
          {photos.map((item, idx) => (
            <button
              key={`${item.src}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="gallery-tile group relative block w-full break-inside-avoid overflow-hidden border border-line bg-surface text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.src}
                  alt={item.caption}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover grayscale contrast-115 transition-all duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 group-focus-visible:scale-105 group-focus-visible:grayscale-0"
                />
                {/* Duotone theme tint when idle, clears on hover/focus */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-accent/15 mix-blend-color transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
                />
              </div>

              {/* Slide-up Caption & Place Chip */}
              <div className="translate-y-1 border-t border-line bg-surface/95 px-3.5 py-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-sans text-xs font-medium leading-snug text-fg sm:text-sm">
                    {item.caption}
                  </span>
                  {item.place && (
                    <span className="inline-flex shrink-0 items-center gap-1 border border-line bg-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      <MapPin className="h-2.5 w-2.5" />
                      {item.place}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        items={photos}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChangeIndex={(next) => setActiveIndex(next)}
      />
    </Section>
  );
}
