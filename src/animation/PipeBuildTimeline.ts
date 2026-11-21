import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface BuildStageMeta {
  readonly code: string;
  readonly title: string;
  readonly summary: string;
}

export const BUILD_STAGES: readonly BuildStageMeta[] = [
  {
    code: "01",
    title: "FABRICATE",
    summary: "Spools, 90° elbow, tee, and support shoes positioned along the pipe rack.",
  },
  {
    code: "02",
    title: "FIT-UP",
    summary: "Flange pairs align and close with studs torqued to specification.",
  },
  {
    code: "03",
    title: "WELD",
    summary: "Root and cap weld beads laid down around every joint with spark arc.",
  },
  {
    code: "04",
    title: "NDT / INSPECT",
    summary: "Ultrasonic and RT scan sweeps each weld seam with pass verification.",
  },
  {
    code: "05",
    title: "HYDROTEST",
    summary: "Line pressurized with test water, gauge sweeps to test mark, hydrotest passed.",
  },
  {
    code: "06",
    title: "HANDOVER",
    summary: "Isolation valve stroked, line tag 6\"-P-1001-A1A fitted — Delivered safely, on schedule.",
  },
];

export interface PipeBuildTargets {
  host: HTMLElement;
  onStageChange?: (stageIndex: number, progress: number) => void;
}

export class PipeBuildTimeline {
  private readonly targets: PipeBuildTargets;
  private ctx: gsap.Context | null = null;

  constructor(targets: PipeBuildTargets) {
    this.targets = targets;
  }

  private setFinishedStaticState(host: HTMLElement): void {
    gsap.set(
      host.querySelectorAll(
        ".part-spool-a, .part-spool-b, .part-elbow, .part-tee, .part-shoe-left, .part-shoe-right"
      ),
      {
        x: 0,
        y: 0,
        opacity: 1,
      }
    );
    gsap.set(host.querySelectorAll(".part-flange-left"), { x: 0, opacity: 1 });
    gsap.set(host.querySelectorAll(".part-flange-right"), { x: 0, opacity: 1 });
    gsap.set(host.querySelectorAll(".part-bolt"), { y: 0, rotation: 0, opacity: 1 });

    host.querySelectorAll<SVGGeometryElement>(".weld-bead").forEach((el) => {
      const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 60;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: 0, opacity: 1 });
    });

    gsap.set(host.querySelectorAll(".weld-spark"), { opacity: 0, scale: 0.4 });
    gsap.set(host.querySelectorAll(".ndt-beam"), { opacity: 0, x: 0 });
    gsap.set(host.querySelectorAll(".ndt-pass"), { opacity: 1, scale: 1 });

    host.querySelectorAll<SVGGeometryElement>(".hydro-flow").forEach((el) => {
      const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 420;
      gsap.set(el, { strokeDasharray: "14 10", strokeDashoffset: len * 0.25, opacity: 1 });
    });

    host.querySelectorAll<SVGGeometryElement>(".gauge-arc-fill").forEach((el) => {
      const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 120;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len * 0.15, opacity: 1 });
    });

    gsap.set(host.querySelectorAll(".gauge-needle-arm"), { rotation: 66, opacity: 1 });
    gsap.set(host.querySelectorAll(".hydro-stamp"), { opacity: 1, scale: 1, y: 0 });
    gsap.set(host.querySelectorAll(".valve-wheel"), { rotation: 270 });
    gsap.set(host.querySelectorAll(".handover-tag, .handover-signoff"), { opacity: 1, y: 0 });

    this.targets.onStageChange?.(BUILD_STAGES.length - 1, 1);
  }

  mount(): void {
    const { host, onStageChange } = this.targets;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    this.ctx = gsap.context(() => {
      if (prefersReduced) {
        this.setFinishedStaticState(host);
        return;
      }

      gsap.set(".part-spool-a", { x: -120, y: -28, opacity: 0 });
      gsap.set(".part-spool-b", { x: 120, y: 28, opacity: 0 });
      gsap.set(".part-elbow", { x: 0, y: -110, opacity: 0 });
      gsap.set(".part-tee", { x: 110, y: -65, opacity: 0 });
      gsap.set(".part-shoe-left, .part-shoe-right", { x: 0, y: 75, opacity: 0 });

      gsap.set(".part-flange-left", { x: -24, opacity: 0.35 });
      gsap.set(".part-flange-right", { x: 24, opacity: 0.35 });
      gsap.set(".part-bolt", { y: -20, rotation: -45, opacity: 0 });

      host.querySelectorAll<SVGGeometryElement>(".weld-bead").forEach((el) => {
        const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 60;
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      });

      gsap.set(".weld-spark", { opacity: 0, scale: 0.2 });
      gsap.set(".ndt-beam", { opacity: 0, x: -14 });
      gsap.set(".ndt-pass", { opacity: 0, scale: 0.5 });

      host.querySelectorAll<SVGGeometryElement>(".hydro-flow").forEach((el) => {
        const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 420;
        gsap.set(el, { strokeDasharray: "14 10", strokeDashoffset: len, opacity: 0 });
      });

      host.querySelectorAll<SVGGeometryElement>(".gauge-arc-fill").forEach((el) => {
        const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 120;
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });

      gsap.set(".gauge-needle-arm", { rotation: -66 });
      gsap.set(".hydro-stamp", { opacity: 0, scale: 1.22, y: -8 });
      gsap.set(".valve-wheel", { rotation: 0 });
      gsap.set(".handover-tag, .handover-signoff", { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: host,
          start: "top top",
          end: isMobile ? "+=220%" : "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(
              BUILD_STAGES.length - 1,
              Math.max(0, Math.floor(p * BUILD_STAGES.length))
            );
            onStageChange?.(idx, p);
          },
        },
      });

      // Stage 01: Spools, elbow, tee & shoes settle onto rack
      tl.to(".part-shoe-left, .part-shoe-right", { y: 0, opacity: 1, duration: 0.55 }, 0.0)
        .to(".part-spool-a", { x: 0, y: 0, opacity: 1, duration: 0.75 }, 0.15)
        .to(".part-elbow", { x: 0, y: 0, opacity: 1, duration: 0.75 }, 0.35)
        .to(".part-tee", { x: 0, y: 0, opacity: 1, duration: 0.75 }, 0.55)
        .to(".part-spool-b", { x: 0, y: 0, opacity: 1, duration: 0.75 }, 0.75)

        // Stage 02: Flanges close & bolts drop + torque
        .to(".part-flange-left", { x: 0, opacity: 1, duration: 0.65 }, 1.05)
        .to(".part-flange-right", { x: 0, opacity: 1, duration: 0.65 }, 1.05)
        .to(".part-bolt", { y: 0, opacity: 1, duration: 0.45, stagger: 0.05 }, 1.45)
        .to(".part-bolt", { rotation: 35, duration: 0.45, stagger: 0.04 }, 1.8)

        // Stage 03: Weld beads & sparks at joints
        .to(".weld-bead", { strokeDashoffset: 0, opacity: 1, duration: 1.0, stagger: 0.14 }, 2.1)
        .to(
          ".weld-spark",
          {
            opacity: 1,
            scale: 1.25,
            duration: 0.25,
            stagger: { amount: 0.75, from: "random" },
          },
          2.15
        )
        .to(".weld-spark", { opacity: 0, scale: 0.3, duration: 0.3 }, 2.85)

        // Stage 04: NDT inspection scan & pass checkmarks
        .to(".ndt-beam", { opacity: 1, x: 14, duration: 0.55, stagger: 0.15 }, 3.15)
        .to(".ndt-beam", { opacity: 0, duration: 0.25 }, 3.65)
        .to(".ndt-pass", { opacity: 1, scale: 1, duration: 0.4, stagger: 0.14 }, 3.65)

        // Stage 05: Hydrotest flow, gauge arc fill & needle sweep, stamp lands
        .to(".hydro-flow", { strokeDashoffset: 0, opacity: 1, duration: 1.05 }, 4.15)
        .to(".gauge-arc-fill", { strokeDashoffset: 12, duration: 0.85 }, 4.35)
        .to(".gauge-needle-arm", { rotation: 66, duration: 0.85 }, 4.35)
        .to(".hydro-stamp", { opacity: 1, scale: 1, y: 0, duration: 0.45 }, 4.85)

        // Stage 06: Valve handwheel turns, line tag & handover note
        .to(".valve-wheel", { rotation: 270, duration: 0.9 }, 5.2)
        .to(".handover-tag", { opacity: 1, y: 0, duration: 0.5 }, 5.45)
        .to(".handover-signoff", { opacity: 1, y: 0, duration: 0.5 }, 5.75);
    }, host);

    ScrollTrigger.refresh();
  }

  unmount(): void {
    this.ctx?.revert();
    this.ctx = null;
  }
}
