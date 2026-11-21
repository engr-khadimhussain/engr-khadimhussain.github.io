const STORAGE_KEY = "builder-prompt-seen";
const BOTTOM_THRESHOLD = 120;

export class BuilderPrompt {
  static hasSeen(): boolean {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  static markSeen(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Storage may be unavailable; the prompt still works for this session.
    }
  }

  static watchBottom(callback: () => void): () => void {
    let active = true;

    const unsubscribe = (): void => {
      if (!active) return;
      active = false;
      window.removeEventListener("scroll", checkBottom);
      window.removeEventListener("resize", checkBottom);
    };

    const checkBottom = (): void => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);

      if (distanceFromBottom <= BOTTOM_THRESHOLD) {
        unsubscribe();
        callback();
      }
    };

    window.addEventListener("scroll", checkBottom, { passive: true });
    window.addEventListener("resize", checkBottom, { passive: true });

    return unsubscribe;
  }
}
