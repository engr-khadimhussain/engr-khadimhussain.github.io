export class SectionNavigator {
  private static readonly CORRECTION_TOLERANCE = 8;
  private static readonly HASH_WAIT_LIMIT = 1500;
  private static readonly PIN_LIMIT = 2500;
  private static readonly STABLE_DURATION = 400;

  static async waitForPageAssets(): Promise<void> {
    const fontsReady = document.fonts.ready;

    const pendingImages = Array.from(document.images).filter(
      (image) =>
        image.loading !== "lazy" &&
        !image.complete,
    );

    const imageLoads = pendingImages.map(
      (image) =>
        new Promise<void>((resolve) => {
          const finish = (): void => {
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
            resolve();
          };

          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
        }),
    );

    await Promise.race([
      Promise.all([fontsReady, ...imageLoads]).then(() => undefined),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, this.HASH_WAIT_LIMIT);
      }),
    ]);
  }

  static alignTarget(id: string, navHeight: number): boolean {
    const target = document.getElementById(id);
    if (!target) return false;

    const desiredTop = navHeight + 8;
    const offset = target.getBoundingClientRect().top - desiredTop;

    if (Math.abs(offset) > this.CORRECTION_TOLERANCE) {
      window.scrollBy({
        top: offset,
        behavior: "auto",
      });
    }

    return true;
  }

  static async scrollTo(id: string, navHeight: number): Promise<void> {
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    await this.waitForScrollEnd();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    this.alignTarget(id, navHeight);
  }

  static async pinHashTarget(
    id: string,
    getNavHeight: () => number,
  ): Promise<void> {
    await this.waitForPageAssets();

    if (!this.alignTarget(id, getNavHeight())) return;

    await new Promise<void>((resolve) => {
      let stopped = false;
      let stableSince = performance.now();
      const startedAt = performance.now();

      const stop = (): void => {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("keydown", stop);
        cancelAnimationFrame(frame);
        resolve();
      };

      const realign = (): void => {
        if (stopped) return;

        const before = document.getElementById(id)?.getBoundingClientRect().top;
        this.alignTarget(id, getNavHeight());
        const after = document.getElementById(id)?.getBoundingClientRect().top;

        if (
          before !== undefined &&
          after !== undefined &&
          Math.abs(after - before) > 0.5
        ) {
          stableSince = performance.now();
        }
      };

      const observer = new ResizeObserver(() => {
        if (stopped) return;
        realign();
        stableSince = performance.now();
      });

      observer.observe(document.body);

      window.addEventListener("wheel", stop, { passive: true, once: true });
      window.addEventListener("touchstart", stop, {
        passive: true,
        once: true,
      });
      window.addEventListener("keydown", stop, { once: true });

      let frame = 0;

      const checkStability = (): void => {
        if (stopped) return;

        const now = performance.now();

        if (
          now - startedAt >= this.PIN_LIMIT ||
          now - stableSince >= this.STABLE_DURATION
        ) {
          stop();
          return;
        }

        frame = requestAnimationFrame(checkStability);
      };

      frame = requestAnimationFrame(checkStability);
    });
  }

  private static waitForScrollEnd(): Promise<void> {
    return new Promise((resolve) => {
      let fallbackTimer = 0;

      const finish = (): void => {
        window.clearTimeout(fallbackTimer);
        window.removeEventListener("scrollend", finish);
        resolve();
      };

      window.addEventListener("scrollend", finish, { once: true });
      fallbackTimer = window.setTimeout(finish, 1200);
    });
  }
}
