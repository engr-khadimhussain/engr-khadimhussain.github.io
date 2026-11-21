import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Briefcase, Calendar, CheckCircle2, Gauge, Globe, RotateCcw } from "lucide-react";
import { profile } from "../models/Profile";
import { WeldSparks } from "../animation/WeldSparks";

gsap.registerPlugin(ScrollTrigger);

function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}

function isLightTheme(host: HTMLElement): boolean {
  if (document.documentElement.dataset.theme === "hydro") return true;
  const rawBg = getComputedStyle(host).getPropertyValue("--bg").trim();
  const rgbMatch = rawBg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]) / 255;
    const g = Number(rgbMatch[2]) / 255;
    const b = Number(rgbMatch[3]) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.55;
  }
  const hexMatch = rawBg.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.55;
  }
  return false;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const arcHeadlineLightRef = useRef<HTMLDivElement>(null);
  const weldRef = useRef<WeldSparks | null>(null);
  const coolTimerRef = useRef<number | null>(null);
  const lastReentryWeldRef = useRef<number>(0);

  // Mobile (< sm) dedicated weld strip refs & state
  const mobileStripHostRef = useRef<HTMLDivElement>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
  const mobileWeldRef = useRef<WeldSparks | null>(null);
  const mobileCoolTimerRef = useRef<number | null>(null);
  const mobileTriggeredOnceRef = useRef<boolean>(false);

  const stats = profile.stats();
  const { person, gallery } = profile;
  const slidePhotos = gallery.slice(0, 4);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightMode, setLightMode] = useState(false);
  const [weldState, setWeldState] = useState<"welding" | "cooling" | "accepted">("welding");
  const [mobileWeldState, setMobileWeldState] = useState<"idle" | "welding" | "cooling" | "accepted">("idle");
  const leadSummary = firstSentence(person.summary);

  const clearWeldTimers = () => {
    if (coolTimerRef.current !== null) {
      window.clearTimeout(coolTimerRef.current);
      coolTimerRef.current = null;
    }
  };

  const clearMobileWeldTimers = () => {
    if (mobileCoolTimerRef.current !== null) {
      window.clearTimeout(mobileCoolTimerRef.current);
      mobileCoolTimerRef.current = null;
    }
  };

  const triggerSingleWeld = useCallback(() => {
    const weld = weldRef.current;
    if (!weld) return;

    clearWeldTimers();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setWeldState("accepted");
      weld.renderStaticComplete();
      return;
    }

    setWeldState("welding");
    weld.start();
  }, []);

  const triggerMobileWeld = useCallback(() => {
    const weld = mobileWeldRef.current;
    if (!weld) return;

    clearMobileWeldTimers();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setMobileWeldState("accepted");
      weld.renderStaticComplete();
      return;
    }

    setMobileWeldState("welding");
    weld.start();
  }, []);

  useEffect(() => {
    const host = sectionRef.current;
    if (!host) return;

    const syncTheme = () => setLightMode(isLightTheme(host));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slidePhotos.length <= 1) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidePhotos.length);
    }, 5200);

    return () => window.clearInterval(id);
  }, [slidePhotos.length]);

  // Mobile (< sm) dedicated weld strip setup: starts once when scrolled into view (threshold 0.6)
  useEffect(() => {
    const stripHost = mobileStripHostRef.current;
    const mobileCanvas = mobileCanvasRef.current;
    if (!stripHost || !mobileCanvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mobileWeld = new WeldSparks(mobileCanvas, stripHost, {
      startXRatio: 0.04,
      endXRatio: 0.96,
      yRatio: 0.5,
      sparkScale: 0.4,
      onWeldComplete: () => {
        setMobileWeldState("cooling");
        mobileCoolTimerRef.current = window.setTimeout(() => {
          setMobileWeldState("accepted");
        }, 2000);
      },
    });
    mobileWeldRef.current = mobileWeld;

    if (prefersReduced) {
      mobileTriggeredOnceRef.current = true;
      setMobileWeldState("accepted");
      mobileWeld.renderStaticComplete();
      return () => {
        clearMobileWeldTimers();
        mobileWeld.destroy();
        mobileWeldRef.current = null;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !mobileTriggeredOnceRef.current) {
          mobileTriggeredOnceRef.current = true;
          observer.disconnect();
          setMobileWeldState("welding");
          mobileWeld.start();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(stripHost);

    return () => {
      clearMobileWeldTimers();
      observer.disconnect();
      mobileWeld.destroy();
      mobileWeldRef.current = null;
    };
  }, []);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const canvasEl = canvasRef.current;
    if (!sectionEl || !canvasEl) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileViewport = window.innerWidth < 640;

    const weld = new WeldSparks(canvasEl, sectionEl, {
      startXRatio: 0.02,
      endXRatio: 0.98,
      yRatio: 0.79,
      onArcPosition: (normX, _normY, active) => {
        const el = arcHeadlineLightRef.current;
        if (!el || prefersReduced || isMobileViewport) return;
        const xPct = Math.round(normX * 100);
        const accent = getComputedStyle(sectionEl).getPropertyValue("--accent").trim();
        el.style.opacity = active ? "0.24" : "0";
        el.style.background = `radial-gradient(circle 280px at ${xPct}% 32%, ${accent}, transparent 75%)`;
      },
      onWeldComplete: () => {
        setWeldState("cooling");
        coolTimerRef.current = window.setTimeout(() => {
          setWeldState("accepted");
        }, 2000);
      },
    });
    weldRef.current = weld;

    if (prefersReduced) {
      setWeldState("accepted");
      weld.renderStaticComplete();
    } else {
      weld.start();
    }

    let wasFullyOut = false;
    const heroVisObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) {
          wasFullyOut = true;
          return;
        }
        if (wasFullyOut && entry.isIntersecting) {
          wasFullyOut = false;
          const now = Date.now();
          if (now - lastReentryWeldRef.current >= 60_000) {
            lastReentryWeldRef.current = now;
            triggerSingleWeld();
          }
        }
      },
      { threshold: 0 }
    );
    heroVisObserver.observe(sectionEl);

    const setFinalStats = () => {
      sectionEl.querySelectorAll<HTMLElement>(".stat-num").forEach((el) => {
        el.textContent = el.dataset.target ?? "0";
      });
    };

    const runCountUp = () => {
      if (prefersReduced) {
        setFinalStats();
        return;
      }
      sectionEl.querySelectorAll<HTMLElement>(".stat-num").forEach((el) => {
        if (el.dataset.counted === "true") return;
        el.dataset.counted = "true";
        const target = Number(el.dataset.target ?? 0);
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.35,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.val).toString();
          },
          onComplete: () => {
            el.textContent = String(target);
          },
        });
      });
    };

    const fallbackTimer = window.setTimeout(runCountUp, 2500);

    let statsObserver: IntersectionObserver | null = null;
    if (statsGridRef.current) {
      statsObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            runCountUp();
            window.clearTimeout(fallbackTimer);
            statsObserver?.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      statsObserver.observe(statsGridRef.current);
    }

    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGGeometryElement>(".plant-stroke");

      if (prefersReduced) {
        gsap.set(".arc-letter", { opacity: 1, y: 0 });
        gsap.set(".hero-fade", { opacity: 1, y: 0 });
        gsap.set(".gauge-needle", { rotation: 32 });
        setFinalStats();
        return;
      }

      paths.forEach((p) => {
        const len = typeof p.getTotalLength === "function" ? p.getTotalLength() : 220;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      gsap.set(".arc-letter", { opacity: 0, y: 12 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 1.35,
        stagger: 0.04,
        ease: "power2.inOut",
      })
        .to(
          ".arc-letter",
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: { amount: 0.65, from: "start" },
            ease: "power2.out",
          },
          0.2
        )
        .from(
          ".hero-fade",
          {
            opacity: 0,
            y: 16,
            duration: 0.65,
            stagger: 0.08,
          },
          0.45
        );

      gsap.to(".heat-shimmer", {
        scaleX: 1.012,
        skewX: 1.1,
        transformOrigin: "center bottom",
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".flare-outer", {
        scaleY: 1.32,
        scaleX: 0.9,
        opacity: 0.9,
        transformOrigin: "50% 100%",
        duration: 0.22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".flare-core", {
        scaleY: 1.44,
        scaleX: 0.8,
        transformOrigin: "50% 100%",
        duration: 0.15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.utils.toArray<SVGCircleElement>(".heat-plume").forEach((puff, idx) => {
        gsap.fromTo(
          puff,
          { y: 0, x: 0, opacity: 0.28, scale: 0.7 },
          {
            y: -36,
            x: idx % 2 === 0 ? 10 : -8,
            opacity: 0,
            scale: 1.75,
            duration: 2.8 + idx * 0.4,
            delay: idx * 0.6,
            repeat: -1,
            ease: "sine.out",
          }
        );
      });

      gsap.to(".gauge-needle", {
        rotation: 55,
        transformOrigin: "50% 85%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    }, sectionRef);

    return () => {
      clearWeldTimers();
      window.clearTimeout(fallbackTimer);
      statsObserver?.disconnect();
      heroVisObserver.disconnect();
      weld.destroy();
      weldRef.current = null;
      ctx.revert();
    };
  }, [triggerSingleWeld]);

  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 8,
      rotateX: -y * 8,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 900,
    });
  };

  const handleCardMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const handleButtonMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const btn = primaryBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
    gsap.to(btn, {
      x: dx,
      y: dy,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonMouseLeave = () => {
    const btn = primaryBtnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: "elastic.out(1, 0.45)",
    });
  };

  const line1 = `${stats.years} YEARS BUILDING`;
  const line2 = "OIL & GAS PLANTS";

  const statItems = [
    { label: "Years Experience", value: stats.years, suffix: "+", icon: Calendar },
    { label: "Countries", value: stats.countries, suffix: "", icon: Globe },
    { label: "Major Projects", value: stats.projects, suffix: "+", icon: Briefcase },
    { label: "AWARDS & RECOGNITIONS", value: stats.awards, suffix: "", icon: Award },
  ];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-[88svh] w-full overflow-x-clip border-b border-line bg-bg flex flex-col justify-between"
    >
      {/* Layer 1: Duotone Ken Burns Slideshow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {slidePhotos.map((photo, idx) => {
          const isActive = idx === activeSlide;
          return (
            <img
              key={`${photo.src}-${idx}`}
              src={photo.src}
              alt=""
              loading="eager"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover grayscale contrast-125 transition-all duration-[2000ms] ease-out ${
                isActive
                  ? lightMode
                    ? "scale-110 opacity-45"
                    : "scale-110 opacity-65"
                  : "scale-100 opacity-0"
              }`}
            />
          );
        })}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            backgroundColor: "var(--bg)",
            opacity: lightMode ? 0.7 : 0.58,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "var(--bg)",
            opacity: lightMode ? 0.7 : 0.58,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 48%, color-mix(in srgb, var(--bg) 32%, transparent) 100%)",
          }}
        />
      </div>

      {/* Layer 2: Blueprint Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-70"
      />

      {/* Layer 3: Line-Art Plant Skyline + Full-Width Weld Seam Pipe */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 440"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-65"
      >
        <line className="plant-stroke" x1="0" y1="392" x2="1200" y2="392" stroke="var(--line)" strokeWidth="1.5" />
        <line className="plant-stroke" x1="0" y1="398" x2="1200" y2="398" stroke="var(--line)" strokeWidth="0.75" strokeDasharray="6 6" />

        {/* Full-width Weld Seam Pipe Run */}
        <line className="plant-stroke" x1="24" y1="347" x2="1176" y2="347" stroke="var(--line)" strokeWidth="5" />
        <line className="plant-stroke" x1="24" y1="341" x2="1176" y2="341" stroke="var(--line)" strokeWidth="1" />
        <line className="plant-stroke" x1="24" y1="353" x2="1176" y2="353" stroke="var(--line)" strokeWidth="1" />
        {[80, 380, 680, 960].map((fx) => (
          <rect
            key={fx}
            className="plant-stroke"
            x={fx - 4}
            y="337"
            width="8"
            height="20"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
          />
        ))}

        {/* Storage Tank */}
        <rect className="plant-stroke" x="65" y="245" width="120" height="86" fill="none" stroke="var(--line)" strokeWidth="1.4" />
        <path className="plant-stroke" d="M65 245 Q125 224 185 245" fill="none" stroke="var(--line)" strokeWidth="1.4" />
        <line className="plant-stroke" x1="65" y1="274" x2="185" y2="274" stroke="var(--line)" strokeWidth="0.8" />
        <line className="plant-stroke" x1="65" y1="302" x2="185" y2="302" stroke="var(--line)" strokeWidth="0.8" />

        {/* Pipe Rack */}
        <line className="plant-stroke" x1="185" y1="278" x2="620" y2="278" stroke="var(--accent)" strokeWidth="1.5" />
        <line className="plant-stroke" x1="185" y1="290" x2="620" y2="290" stroke="var(--line)" strokeWidth="1.2" />
        {[235, 315, 395, 475, 555].map((x) => (
          <line key={x} className="plant-stroke" x1={x} y1="274" x2={x} y2="392" stroke="var(--line)" strokeWidth="1.15" />
        ))}

        {/* Distillation Columns */}
        <rect className="plant-stroke" x="645" y="122" width="44" height="270" rx="22" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <line className="plant-stroke" x1="645" y1="180" x2="689" y2="180" stroke="var(--line)" strokeWidth="0.9" />
        <line className="plant-stroke" x1="645" y1="238" x2="689" y2="238" stroke="var(--line)" strokeWidth="0.9" />
        <line className="plant-stroke" x1="645" y1="296" x2="689" y2="296" stroke="var(--line)" strokeWidth="0.9" />

        <rect className="plant-stroke" x="742" y="168" width="38" height="224" rx="19" fill="none" stroke="var(--line)" strokeWidth="1.4" />
        <polyline className="plant-stroke" points="667,122 667,102 722,102 722,340 742,340" fill="none" stroke="var(--accent)" strokeWidth="1.4" />
      </svg>

      {/* Dedicated Flare Stack Group */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-[4%] bottom-[76px] z-10 h-[58svh] max-h-[520px] w-28"
      >
        <svg
          viewBox="0 0 112 360"
          preserveAspectRatio="xMidYMax meet"
          className="h-full w-full overflow-visible opacity-75"
        >
          <line className="plant-stroke" x1="56" y1="112" x2="56" y2="360" stroke="var(--line)" strokeWidth="1.8" />
          <polyline className="plant-stroke" points="36,360 51,156 61,156 76,360" fill="none" stroke="var(--line)" strokeWidth="1.1" />
          <polyline className="plant-stroke" points="40,310 72,260 42,212 68,172" fill="none" stroke="var(--line)" strokeWidth="0.9" />

          <circle className="heat-plume" cx="56" cy="54" r="8" fill="var(--line)" />
          <circle className="heat-plume" cx="61" cy="42" r="10" fill="var(--line)" />
          <circle className="heat-plume" cx="51" cy="32" r="9" fill="var(--line)" />

          <ellipse
            className="flare-outer"
            cx="56"
            cy="84"
            rx="22"
            ry="32"
            fill="var(--accent)"
            opacity="0.22"
          />

          <path
            className="flare-outer"
            d="M56 110 C33 84 42 48 57 22 C68 48 83 72 71 98 C66 106 60 110 56 110 Z"
            fill="var(--accent)"
          />
          <path
            className="flare-core"
            d="M56 108 C44 90 51 68 57 50 C63 68 70 84 63 102 C60 106 58 108 56 108 Z"
            fill="var(--primary2)"
          />
        </svg>
      </div>

      {/* Layer 4: Welding Arc & Sparks Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-90 sm:opacity-100"
      />

      {/* Inspection Tag at End of Weld Seam (sm+) */}
      <div
        className={`pointer-events-auto absolute right-4 bottom-56 z-20 hidden sm:flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-all duration-700 lg:right-8 ${
          weldState === "accepted"
            ? "translate-y-0 border-accent/70 bg-surface/95 text-fg opacity-100"
            : weldState === "cooling"
              ? "translate-y-0 border-accent bg-surface/80 text-accent opacity-80"
              : "pointer-events-none translate-y-1 border-line bg-surface/60 text-muted opacity-0"
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span>WELD W-01 · ACCEPTED</span>
        <button
          type="button"
          onClick={triggerSingleWeld}
          aria-label="Re-weld seam"
          title="Re-weld seam"
          className="ml-1 inline-flex h-5 w-5 items-center justify-center border border-line bg-bg text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-6 sm:pb-10 lg:pt-20">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="relative min-w-0 lg:col-span-7 space-y-5 sm:space-y-6">
            <div
              ref={arcHeadlineLightRef}
              aria-hidden="true"
              className="pointer-events-none hidden sm:block absolute -inset-6 -z-10 opacity-0 transition-opacity duration-300"
            />

            <div
              style={{ fontSize: "clamp(8px, 2.35vw, 10px)" }}
              className="hero-fade inline-flex max-w-full items-center gap-1.5 sm:gap-2 whitespace-nowrap border border-line bg-surface/90 px-2 py-1 sm:px-3 sm:py-1.5 font-mono tracking-[0.12em] sm:!text-[11px] sm:!tracking-[0.2em] uppercase text-accent"
            >
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 shrink-0 rounded-full bg-accent" />
              <span>PIPING · FABRICATION · ERECTION · TURNAROUNDS</span>
            </div>

            <h1 className="font-display text-5xl font-bold uppercase leading-[0.94] tracking-tight text-fg sm:text-6xl lg:text-7xl">
              <span className="block">
                {line1.split("").map((ch, i) => (
                  <span key={`l1-${i}`} className="arc-letter inline-block">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
              <span className="heat-shimmer block text-accent">
                {line2.split("").map((ch, i) => (
                  <span key={`l2-${i}`} className="arc-letter inline-block">
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </span>
            </h1>

            <p className="hero-fade max-w-xl font-sans text-lg font-medium text-fg sm:text-xl">
              {person.title}
            </p>

            {leadSummary && (
              <p className="hero-fade max-w-xl font-sans text-sm leading-relaxed text-muted sm:text-base">
                {leadSummary}
              </p>
            )}

            <div className="hero-fade flex flex-wrap items-center gap-4 pt-2">
              <a
                ref={primaryBtnRef}
                href="#journey"
                onMouseMove={handleButtonMouseMove}
                onMouseLeave={handleButtonMouseLeave}
                className="inline-flex items-center justify-center bg-accent px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-widest text-on-accent transition-shadow hover:shadow-md will-change-transform"
              >
                Explore the journey
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center border border-line bg-surface/85 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Right Column: Engineering Drawing Title Block Card */}
          <div className="hero-fade lg:col-span-5 flex justify-center lg:justify-end">
            <div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="w-full max-w-xs sm:max-w-[340px] border-2 border-line bg-surface shadow-sm will-change-transform"
            >
              <div className="flex items-center justify-between border-b border-line bg-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span>DWG NO. SUP-{person.careerStart}-01</span>
                <span className="text-accent">REV. {new Date().getFullYear()}</span>
              </div>

              <div className="relative p-3 bg-surface">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-bg">
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover object-top"
                  />
                  <span className="pointer-events-none absolute top-1.5 left-1.5 h-2.5 w-2.5 border-t border-l border-accent" />
                  <span className="pointer-events-none absolute top-1.5 right-1.5 h-2.5 w-2.5 border-t border-r border-accent" />
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-accent" />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-line font-mono text-[11px]">
                <div className="border-r border-b border-line p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-muted">NAME</span>
                  <span className="mt-0.5 block truncate font-semibold uppercase text-fg">
                    {person.name}
                  </span>
                </div>
                <div className="border-b border-line p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-muted">DISCIPLINE</span>
                  <span className="mt-0.5 block font-semibold uppercase text-fg">
                    Mechanical / Piping
                  </span>
                </div>
                <div className="border-r border-line p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-muted">SINCE</span>
                  <span className="mt-0.5 block font-semibold text-accent">
                    {person.careerStart}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-muted">LOCATIONS</span>
                  <span className="mt-0.5 block font-semibold text-fg">
                    {person.countries.length} COUNTRIES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile (< sm) Dedicated Weld Strip Between Card and Stats Bar */}
        <div className="mt-6 block sm:hidden">
          <div
            ref={mobileStripHostRef}
            className="relative h-14 w-full overflow-hidden border border-line/80 bg-surface/80"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 400 56"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <line x1="12" y1="28" x2="388" y2="28" stroke="var(--line)" strokeWidth="4" />
              <line x1="12" y1="23" x2="388" y2="23" stroke="var(--line)" strokeWidth="0.9" />
              <line x1="12" y1="33" x2="388" y2="33" stroke="var(--line)" strokeWidth="0.9" />
              {/* Left Flange */}
              <rect x="118" y="16" width="6" height="24" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
              {/* Right Flange */}
              <rect x="276" y="16" width="6" height="24" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
            <canvas
              ref={mobileCanvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          </div>

          {mobileWeldState === "accepted" && (
            <div className="mt-2 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fg">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span>WELD W-01 · ACCEPTED</span>
              <button
                type="button"
                onClick={triggerMobileWeld}
                aria-label="Re-weld mobile seam"
                title="Re-weld mobile seam"
                className="inline-flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center border border-line bg-surface text-muted transition-colors active:border-accent active:text-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats & Pressure Gauge Scroll Indicator */}
      <div className="relative z-20 border-t border-line bg-surface/90 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={statsGridRef}
            className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4 md:divide-y-0"
          >
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3.5 px-4 py-4 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-bg text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold leading-none text-fg">
                      <span className="stat-num" data-target={item.value}>
                        {item.value}
                      </span>
                      {item.suffix}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <a
          href="#journey"
          className="flex items-center justify-center gap-2.5 border-t border-line bg-bg/85 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-accent"
        >
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface">
            <Gauge className="h-3 w-3 text-muted/60" />
            <span
              aria-hidden="true"
              className="gauge-needle absolute bottom-1 left-1/2 h-2 w-0.5 -translate-x-1/2 -rotate-40 origin-bottom bg-accent"
            />
          </span>
          <span>SCROLL</span>
        </a>
      </div>
    </section>
  );
}
