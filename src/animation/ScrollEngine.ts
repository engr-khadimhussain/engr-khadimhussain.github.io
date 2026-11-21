import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class ScrollEngine {
  private static instance: ScrollEngine | null = null;

  private lenis: Lenis | null = null;
  private frame = 0;
  private readonly reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  static init(): ScrollEngine {
    if (!this.instance) {
      this.instance = new ScrollEngine();
    }
    return this.instance;
  }

  private constructor() {
    if (this.reducedMotion) return;

    this.lenis = new Lenis();

    this.lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      this.lenis?.raf(time * 1000);
      this.frame = requestAnimationFrame(tick);
    };

    gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
    ScrollTrigger.refresh();
    this.frame = requestAnimationFrame(tick);
  }

  revealUp(selector: string): void {
    if (this.reducedMotion) return;

    gsap.fromTo(
      selector,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: selector,
          start: "top 85%",
          once: true,
        },
      },
    );
  }

  drawPath(selector: string): void {
    if (this.reducedMotion) return;

    gsap.fromTo(
      selector,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: selector,
          start: "top 85%",
          once: true,
        },
      },
    );
  }

  destroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);

    this.lenis?.destroy();
    this.lenis = null;

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
    ScrollEngine.instance = null;
  }
}
