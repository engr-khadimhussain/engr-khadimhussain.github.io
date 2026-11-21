export interface WeldSparksOptions {
  startXRatio?: number;
  endXRatio?: number;
  yRatio?: number;
  sparkScale?: number;
  onArcPosition?: (normX: number, normY: number, active: boolean) => void;
  onWeldComplete?: () => void;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hot: boolean;
}

export class WeldSparks {
  private readonly canvas: HTMLCanvasElement;
  private readonly host: HTMLElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly startXRatio: number;
  private readonly endXRatio: number;
  private readonly yRatio: number;
  private readonly sparkScale: number;
  private readonly onArcPosition?: (normX: number, normY: number, active: boolean) => void;
  private readonly onWeldComplete?: () => void;

  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private sparks: SparkParticle[] = [];
  private running = false;
  private startTime = 0;
  private readonly weldDurationMs = 4500;
  private readonly burstTailMs = 450;
  private burstSpawned = false;
  private completedFired = false;

  private accentColor = "#f97316";
  private hotColor = "#fff7ed";
  private lineColor = "#94a3b8";

  constructor(canvas: HTMLCanvasElement, host: HTMLElement, options: WeldSparksOptions = {}) {
    this.canvas = canvas;
    this.host = host;
    this.ctx = canvas.getContext("2d");
    this.startXRatio = options.startXRatio ?? 0.02;
    this.endXRatio = options.endXRatio ?? 0.98;
    this.yRatio = options.yRatio ?? 0.79;
    this.sparkScale = options.sparkScale ?? 1;
    this.onArcPosition = options.onArcPosition;
    this.onWeldComplete = options.onWeldComplete;
  }

  private syncThemeColors(): void {
    const styles = getComputedStyle(this.host);
    const accent = styles.getPropertyValue("--accent").trim();
    const primary2 = styles.getPropertyValue("--primary2").trim();
    const line = styles.getPropertyValue("--line").trim();
    if (accent) this.accentColor = accent;
    if (primary2) this.hotColor = primary2;
    if (line) this.lineColor = line;
  }

  private resize = (): void => {
    const rect = this.host.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  };

  private spawnSparks(x: number, y: number, count: number, burst = false): void {
    const adjusted = Math.max(1, Math.round(count * this.sparkScale));
    for (let i = 0; i < adjusted; i += 1) {
      const angle = burst
        ? -Math.PI * 0.92 + Math.random() * Math.PI * 0.84
        : -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
      const speed = (burst ? 45 + Math.random() * 145 : 28 + Math.random() * 95) *
        (0.75 + 0.25 * this.sparkScale);
      const maxLife = burst
        ? 0.28 + Math.random() * 0.32
        : 0.22 + Math.random() * 0.28;

      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 25 : 10),
        life: 0,
        maxLife,
        size: burst ? 1.5 + Math.random() * 2.2 : 1.1 + Math.random() * 1.7,
        hot: Math.random() > 0.35,
      });
    }
  }

  private drawFinishedSeam(): void {
    if (!this.ctx || this.width <= 0 || this.height <= 0) return;
    const x1 = this.width * this.startXRatio;
    const x2 = this.width * this.endXRatio;
    const y = this.height * this.yRatio;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y);
    this.ctx.lineTo(x2, y);
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = 3.5;
    this.ctx.lineCap = "round";
    this.ctx.stroke();
    this.ctx.restore();
  }

  public renderStaticComplete(): void {
    this.stop();
    this.syncThemeColors();
    this.resize();
    this.drawFinishedSeam();
    this.onArcPosition?.(1, this.yRatio, false);
  }

  public start(): void {
    this.stop();
    this.syncThemeColors();
    this.resize();

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(this.host);
    }

    if (!this.ctx) return;

    this.sparks = [];
    this.startTime = performance.now();
    this.burstSpawned = false;
    this.completedFired = false;
    this.running = true;

    const step = (now: number) => {
      if (!this.running || !this.ctx) return;

      const elapsed = now - this.startTime;
      const weldProgress = Math.min(1, elapsed / this.weldDurationMs);
      const isWelding = weldProgress < 1;

      const x1 = this.width * this.startXRatio;
      const x2 = this.width * this.endXRatio;
      const y = this.height * this.yRatio;
      const arcX = x1 + (x2 - x1) * weldProgress;

      this.ctx.clearRect(0, 0, this.width, this.height);

      if (arcX > x1 + 1) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y);
        this.ctx.lineTo(arcX, y);
        this.ctx.strokeStyle = isWelding ? this.accentColor : this.lineColor;
        this.ctx.lineWidth = 3.5;
        this.ctx.lineCap = "round";
        this.ctx.stroke();
        this.ctx.restore();
      }

      if (isWelding) {
        this.onArcPosition?.(arcX / Math.max(1, this.width), this.yRatio, true);

        this.ctx.save();
        const glow = this.ctx.createRadialGradient(arcX, y, 1, arcX, y, 22);
        glow.addColorStop(0, this.hotColor);
        glow.addColorStop(0.45, this.accentColor);
        glow.addColorStop(1, "transparent");
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(arcX, y, 22, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = this.hotColor;
        this.ctx.beginPath();
        this.ctx.arc(arcX, y, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        const spawnChance = 0.72 * Math.min(1, Math.max(0.35, this.sparkScale));
        if (Math.random() < spawnChance) {
          this.spawnSparks(arcX, y, 2, false);
        }
      } else {
        this.onArcPosition?.(1, this.yRatio, false);

        if (!this.burstSpawned) {
          this.burstSpawned = true;
          this.spawnSparks(x2, y, 18, true);
        }

        if (!this.completedFired) {
          this.completedFired = true;
          this.onWeldComplete?.();
        }
      }

      const dt = 1 / 60;
      const gravity = 260;
      for (let i = this.sparks.length - 1; i >= 0; i -= 1) {
        const p = this.sparks[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          this.sparks.splice(i, 1);
          continue;
        }
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = p.hot ? this.hotColor : this.accentColor;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (isWelding || elapsed < this.weldDurationMs + this.burstTailMs || this.sparks.length > 0) {
        this.rafId = window.requestAnimationFrame(step);
      } else {
        this.drawFinishedSeam();
        this.running = false;
        this.rafId = null;
      }
    };

    this.rafId = window.requestAnimationFrame(step);
  }

  public stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public destroy(): void {
    this.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
