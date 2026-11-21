import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, UserCheck } from "lucide-react";
import { Section } from "../components/ui/Section";
import { Lightbox } from "../components/Lightbox";
import { profile, type GalleryItem } from "../models/Profile";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItemWithFeatured extends GalleryItem {
  featured?: boolean;
}

export function Gallery() {
  const sectionContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const photos = profile.gallery as readonly GalleryItemWithFeatured[];

  const featuredEntries = photos
    .map((item, idx) => ({ item, index: idx }))
    .filter(({ item, index }) => Boolean(item.featured) || index < 3)
    .slice(0, 3);

  const featuredIndexSet = new Set(featuredEntries.map(({ index }) => index));
  const restEntries = photos
    .map((item, idx) => ({ item, index: idx }))
    .filter(({ index }) => !featuredIndexSet.has(index));

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(".gallery-tile", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".gallery-tile",
        { y: 18, opacity: 1 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: { amount: 0.45, from: "start" },
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionContainerRef.current,
            start: "top 92%",
            once: true,
          },
        }
      );
    }, sectionContainerRef);

    const refreshAll = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refreshAll);
    window.addEventListener("load", refreshAll);

    return () => {
      window.removeEventListener("load", refreshAll);
      ctx.revert();
    };
  }, [photos.length]);

  const renderTile = (
    item: GalleryItemWithFeatured,
    idx: number,
    isFeaturedRow = false
  ) => {
    const featured = Boolean(item.featured) || isFeaturedRow;

    return (
      <button
        key={`${item.src}-${idx}`}
        type="button"
        onClick={() => setActiveIndex(idx)}
        className={`gallery-tile group relative flex h-full w-full flex-col overflow-hidden border bg-surface text-left opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          featured ? "border-accent" : "border-line"
        }`}
      >
        <div
          className={`relative w-full overflow-hidden ${
            isFeaturedRow ? "h-64 sm:h-72 lg:h-80" : "aspect-[4/3]"
          }`}
        >
          <img
            src={item.src}
            alt={item.caption}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 ${
              isFeaturedRow
                ? "object-top"
                : "object-[center_30%] grayscale contrast-115 group-hover:grayscale-0 group-focus-visible:grayscale-0"
            }`}
          />

          {!featured && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-accent/15 mix-blend-color transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
            />
          )}

          {featured && (
            <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-on-accent shadow-xs">
              <UserCheck className="h-3 w-3 shrink-0" />
              <span>KHADIM HUSSAIN</span>
            </div>
          )}
        </div>

        <div className="mt-auto translate-y-1 border-t border-line bg-surface/95 px-3.5 py-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
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
    );
  };

  return (
    <Section id="onsite" eyebrow="FROM THE FIELD" title="On Site">
      <div ref={sectionContainerRef} className="space-y-6">
        {/* Featured Row on lg (3 equal columns, uniform height); flows naturally first on mobile */}
        {featuredEntries.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
            {featuredEntries.map(({ item, index }) => renderTile(item, index, true))}
          </div>
        )}

        {/* Uniform Grid for Remaining Site Photographs */}
        {restEntries.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
            {restEntries.map(({ item, index }) => renderTile(item, index, false))}
          </div>
        )}
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
