export class SectionNavigator {
  private static readonly CORRECTION_TOLERANCE = 8;

  static async waitForPageAssets(): Promise<void> {
    await document.fonts.ready;

    const images = Array.from(document.images);
    await Promise.all(
      images.map(async (image) => {
        try {
          await image.decode();
        } catch {
          // A failed or unavailable image should not block navigation.
        }
      }),
    );
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

    const offset = target.getBoundingClientRect().top - navHeight;

    if (Math.abs(offset) > this.CORRECTION_TOLERANCE) {
      window.scrollBy({
        top: offset,
        behavior: "smooth",
      });
    }
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
