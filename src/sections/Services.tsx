import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../components/ui/Section";
import { Icon } from "../components/ui/Icon";
import type { ServiceIcon } from "../components/ui/Icon";
import { profile } from "../models/Profile";

gsap.registerPlugin(ScrollTrigger);

function Flange() {
  const bolts = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4;
    return {
      x: 40 + Math.cos(angle) * 29,
      y: 40 + Math.sin(angle) * 29,
    };
  });

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:rotate-[22deg]"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="35" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="25" stroke="var(--accent)" strokeWidth="1" />
      {bolts.map((bolt, index) => (
        <circle
          key={index}
          cx={bolt.x}
          cy={bolt.y}
          r="2.5"
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".service-card");

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            {
              y: 35,
              clipPath: "inset(0 0 100% 0)",
            },
            {
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 95%",
                once: true,
              },
            },
          );
        });
      });
    }, element);

    return () => context.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      <Section id="services" eyebrow="WHAT HE DELIVERS" title="Services">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {profile.services.map((service, index) => (
            <article
              key={service.id}
              className="service-card group relative overflow-hidden border border-line bg-surface p-6 transition-colors duration-300 hover:border-accent md:p-8"
            >
              <div className="weld-bead pointer-events-none absolute left-0 top-0 h-[3px] w-full origin-left">
                <span className="weld-head absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
                {Array.from({ length: 7 }, (_, particleIndex) => (
                  <span
                    key={particleIndex}
                    className={`weld-particle weld-particle-${particleIndex + 1}`}
                  />
                ))}
              </div>

              <div className="mb-7 flex items-center justify-between">
                <div className="relative h-20 w-20">
                  <Flange />
                  <div className="absolute inset-0 flex items-center justify-center text-accent">
                    <Icon
                      name={service.icon as ServiceIcon}
                      size={34}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                <span className="font-mono text-xs tracking-widest text-muted">
                  SRV-{String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mb-3 font-display text-2xl font-bold uppercase tracking-wide text-fg md:text-3xl">
                {service.title}
              </h3>

              <p className="max-w-xl text-sm leading-7 text-muted">
                {service.text}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <style>{`
        .weld-bead {
          opacity: 0;
          transform: scaleX(0);
          background: linear-gradient(
            90deg,
            var(--line) 0%,
            var(--accent) 72%,
            #fff 100%
          );
          box-shadow:
            0 0 7px var(--accent),
            0 0 15px color-mix(in srgb, var(--accent) 65%, transparent);
          transition:
            transform 700ms cubic-bezier(0.2, 0.75, 0.25, 1),
            opacity 900ms ease;
        }

        .weld-started .weld-bead {
          opacity: 1;
          transform: scaleX(1);
        }

        .weld-head {
          background: #fff;
          box-shadow:
            0 0 5px #fff,
            0 0 11px var(--accent),
            0 0 18px var(--accent);
        }

        .weld-particle {
          position: absolute;
          right: 0;
          top: 0;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: #fff;
          opacity: 0;
          box-shadow: 0 0 7px var(--accent);
        }

        .weld-particle-1 { --particle-x: -12px; --particle-y: -13px; --particle-delay: 80ms; }
        .weld-particle-2 { --particle-x: -25px; --particle-y: -20px; --particle-delay: 150ms; }
        .weld-particle-3 { --particle-x: -39px; --particle-y: -9px; --particle-delay: 220ms; }
        .weld-particle-4 { --particle-x: -52px; --particle-y: -17px; --particle-delay: 290ms; }
        .weld-particle-5 { --particle-x: -66px; --particle-y: -11px; --particle-delay: 360ms; }
        .weld-particle-6 { --particle-x: -78px; --particle-y: -23px; --particle-delay: 430ms; }
        .weld-particle-7 { --particle-x: -91px; --particle-y: -14px; --particle-delay: 500ms; }

        .weld-started .weld-particle {
          animation: weld-spark 650ms ease-out both;
          animation-delay: var(--particle-delay);
        }

        @keyframes weld-spark {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.5);
          }
          20% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(var(--particle-x), var(--particle-y)) scale(0);
          }
        }

        @media (hover: hover) and (pointer: fine) {
          .service-card:hover .weld-bead {
            opacity: 1;
            transform: scaleX(1);
          }

          .service-card:hover .weld-particle {
            animation: weld-spark 650ms ease-out both;
            animation-delay: var(--particle-delay);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .service-card,
          .service-card *,
          .weld-bead {
            animation: none !important;
            transition: none !important;
          }

          .weld-bead {
            opacity: 0;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
