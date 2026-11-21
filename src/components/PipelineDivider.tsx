import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface PipelineDividerProps {
  label?: string;
}

export function PipelineDivider({ label = '6"-P-1001-A1A' }: PipelineDividerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<SVGSVGElement>(null);
  const flowRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        if (wheelRef.current) gsap.set(wheelRef.current, { rotation: 90 });
        if (flowRef.current) gsap.set(flowRef.current, { strokeDashoffset: 0 });
        return;
      }

      if (wheelRef.current) {
        gsap.fromTo(
          wheelRef.current,
          { rotation: 0 },
          {
            rotation: 360,
            ease: "none",
            transformOrigin: "50% 50%",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }

      if (flowRef.current) {
        gsap.fromTo(
          flowRef.current,
          { strokeDashoffset: 180 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 90%",
              end: "bottom 20%",
              scrub: 0.4,
            },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="relative mx-auto flex w-full max-w-7xl items-center justify-center overflow-x-clip px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="relative flex w-full items-center">
        {/* Left Flange */}
        <span className="h-7 w-2.5 shrink-0 border border-line bg-surface" />
        <span className="h-5 w-1.5 shrink-0 border-y border-line bg-bg" />

        {/* Horizontal Pipe + Flowing Accent Product */}
        <div className="relative h-3 flex-1 border-y border-line bg-surface">
          <svg
            viewBox="0 0 800 12"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <line
              ref={flowRef}
              x1="0"
              y1="6"
              x2="800"
              y2="6"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray="18 12"
              strokeDashoffset="180"
            />
          </svg>
        </div>

        {/* Center Gate Valve & Handwheel */}
        <div className="relative z-10 mx-1 flex shrink-0 flex-col items-center">
          <svg
            ref={wheelRef}
            viewBox="0 0 48 48"
            className="h-11 w-11 text-accent"
          >
            <line x1="24" y1="24" x2="24" y2="42" stroke="var(--line)" strokeWidth="3" />
            <circle cx="24" cy="18" r="13" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.5" />
            <line x1="11" y1="18" x2="37" y2="18" stroke="var(--accent)" strokeWidth="2" />
            <line x1="24" y1="5" x2="24" y2="31" stroke="var(--accent)" strokeWidth="2" />
            <circle cx="24" cy="18" r="3.5" fill="var(--accent)" />
          </svg>
          {label && (
            <span className="mt-0.5 border border-line bg-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
              {label}
            </span>
          )}
        </div>

        {/* Right Pipe + Flange */}
        <div className="relative h-3 flex-1 border-y border-line bg-surface">
          <svg
            viewBox="0 0 800 12"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <line
              x1="0"
              y1="6"
              x2="800"
              y2="6"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray="18 12"
            />
          </svg>
        </div>

        <span className="h-5 w-1.5 shrink-0 border-y border-line bg-bg" />
        <span className="h-7 w-2.5 shrink-0 border border-line bg-surface" />
      </div>
    </div>
  );
}
