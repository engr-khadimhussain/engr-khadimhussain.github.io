interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  streakScale: number;
  hot: boolean;
}

interface BeadPoint {
  x: number;
  y: number;
  age: number;
}

export interface WeldSeamConfig {
  startXRatio: number;
  endXRatio: number;
  yRatio: number;
  onArcPosition?: (normX: number, normY: number, active: boolean) => void;
}

export class WeldSparks {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly host: HTMLElement;
  private readonly seam: WeldSeamConfig;
  private readonly reducedMotion: boolean;

  private sparks: SparkParticle[] = [];
  private bead: BeadPoint[] = [];
  private rafId: number | null = null;
  private lastTime = 0;
  private progress = 0;
  private isVisible = true;
  private isTabHidden = false;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private accentColor = "rgb(245, 158, 11)";
  private lineColor = "rgb(148, 163, 184)";

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    host: HTMLElement,
    seam: WeldSeamConfig = { startXRatio: 0.02, endXRatio: 0.98, yRatio: 0.78 }
  ) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2D canvas context unavailable");
    }
    this.canvas = canvas;
    this.ctx = context;
    this.host = host;
    this.seam = seam;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private readThemeColors(): void {
    const styles = getComputedStyle(this.host);
    const accent = styles.getPropertyValue("--accent").trim();
    const line = styles.getPropertyValue("--line").trim();
    if (accent) this.accentColor = accent;
    if (line) this.lineColor = line;
  }

  private updateSize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private getSeamCoords(t: number): { x: number; y: number } {
    const x0 = this.width * this.seam.startXRatio;
    const x1 = this.width * this.seam.endXRatio;
    const baseY = this.height * this.seam.yRatio;
    const x = x0 + (x1 - x0) * t;
    const y = baseY + Math.sin(t * Math.PI * 3) * 2.5;
    return { x, y };
  }

  private emitSparks(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.sparks.length > 220) break;
      const isLongStreak = Math.random() < 0.35;
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.65;
      const speed = isLongStreak ? 210 + Math.random() * 210 : 85 + Math.random() * 220;
      const maxLife = isLongStreak ? 0.36 + Math.random() * 0.42 : 0.25 + Math.random() * 0.48;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 45,
        life: 0,
        maxLife,
        size: isLongStreak ? 1.5 + Math.random() * 1.4 : 1.1 + Math.random() * 1.8,
        streakScale: isLongStreak ? 0.045 : 0.022,
        hot: Math.random() > 0.35,
      });
    }
  }

  private drawStaticFinishedWeld(): void {
    this.readThemeColors();
    this.updateSize();
    this.ctx.clearRect(0, 0, this.width, this.height);

    const x0 = this.width * this.seam.startXRatio;
    const x1 = this.width * this.seam.endXRatio;
    const y = this.height * this.seam.yRatio;

    this.ctx.save();
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y);
    this.ctx.lineTo(x1, y);
    this.ctx.stroke();

    this.ctx.strokeStyle = this.accentColor;
    this.ctx.lineWidth = 1.6;
    this.ctx.setLineDash([6, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(x0 + 8, y);
    this.ctx.lineTo(x1 - 8, y);
    this.ctx.stroke();
    this.ctx.restore();

    this.seam.onArcPosition?.(0.5, this.seam.yRatio, false);
  }

  private step = (now: number): void => {
    this.rafId = null;
    if (!this.isVisible || this.isTabHidden || this.reducedMotion) return;

    if (!this.lastTime) this.lastTime = now;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.readThemeColors();

    // Traverse full seam left-to-right, then restart from left while old bead fades out
    const speed = 0.16;
    this.progress += speed * dt;
    if (this.progress > 1) {
      this.progress %= 1;
    }

    const weldPos = this.getSeamCoords(this.progress);
    this.bead.push({ x: weldPos.x, y: weldPos.y, age: 0 });
    if (this.bead.length > 140) {
      this.bead.shift();
    }

    this.emitSparks(weldPos.x, weldPos.y, 4 + Math.floor(Math.random() * 4));

    // Age cooling weld bead so old pass fades out cleanly
    for (let i = this.bead.length - 1; i >= 0; i--) {
      this.bead[i].age += dt;
      if (this.bead[i].age > 2.2) {
        this.bead.splice(i, 1);
      }
    }

    // Update sparks with gravity and bounce off pipe seam
    const gravity = 580;
    const pipeY = this.height * this.seam.yRatio;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        this.sparks.splice(i, 1);
        continue;
      }

      const prevY = s.y;
      s.vy += gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (prevY <= pipeY && s.y >= pipeY && s.vy > 0) {
        s.y = pipeY;
        s.vy = -s.vy * 0.45;
        s.vx *= 0.84;
      }
    }

    this.render(weldPos.x, weldPos.y);
    this.seam.onArcPosition?.(weldPos.x / this.width, weldPos.y / this.height, true);
    this.rafId = requestAnimationFrame(this.step);
  };

  private render(torchX: number, torchY: number): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Cooling Weld Bead
    if (this.bead.length > 1) {
      this.ctx.save();
      this.ctx.lineCap = "round";
      for (let i = 1; i < this.bead.length; i++) {
        const p0 = this.bead[i - 1];
        const p1 = this.bead[i];
        // Skip segment if wrapped across seam restart
        if (Math.abs(p1.x - p0.x) > this.width * 0.25) continue;

        const ratio = Math.min(1, p1.age / 2.2);
        this.ctx.beginPath();
        this.ctx.moveTo(p0.x, p0.y);
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.lineWidth = 3.6 - ratio * 1.6;
        this.ctx.globalAlpha = Math.max(0, (1 - ratio) * 0.92);
        this.ctx.strokeStyle =
          ratio < 0.22 ? "#ffffff" : ratio < 0.65 ? this.accentColor : this.lineColor;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    // 2. Additive Soft Pipe Bloom, Welding Arc & Streaks
    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    const bloomRadius = 64 + Math.random() * 18;
    const bloom = this.ctx.createRadialGradient(torchX, torchY, 2, torchX, torchY, bloomRadius);
    bloom.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    bloom.addColorStop(0.25, this.accentColor);
    bloom.addColorStop(0.6, this.accentColor);
    bloom.addColorStop(1, "rgba(255, 255, 255, 0)");

    this.ctx.globalAlpha = 0.72;
    this.ctx.fillStyle = bloom;
    this.ctx.beginPath();
    this.ctx.arc(torchX, torchY, bloomRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Hot white-gold core
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(torchX, torchY, 3.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Sparks & longer streaks
    for (const s of this.sparks) {
      const alpha = Math.max(0, 1 - s.life / s.maxLife);
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = s.hot ? "#ffffff" : this.accentColor;
      this.ctx.lineWidth = s.size;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x - s.vx * s.streakScale, s.y - s.vy * s.streakScale);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private handleVisibilityChange = (): void => {
    this.isTabHidden = document.hidden;
    if (!this.isTabHidden && this.isVisible && !this.reducedMotion && this.rafId === null) {
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.step);
    }
  };

  start(): void {
    if (this.reducedMotion) {
      this.drawStaticFinishedWeld();
      this.resizeObserver = new ResizeObserver(() => this.drawStaticFinishedWeld());
      this.resizeObserver.observe(this.canvas);
      return;
    }

    this.updateSize();
    this.readThemeColors();

    this.resizeObserver = new ResizeObserver(() => {
      this.updateSize();
    });
    this.resizeObserver.observe(this.canvas);

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = Boolean(entry && entry.isIntersecting);
        if (this.isVisible && !this.isTabHidden && this.rafId === null) {
          this.lastTime = performance.now();
          this.rafId = requestAnimationFrame(this.step);
        } else if (!this.isVisible && this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      },
      { threshold: 0.05 }
    );
    this.intersectionObserver.observe(this.host);

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.step);
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }
}
