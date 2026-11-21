export class Clipboard {
  static async copy(text: string, fallbackTarget: HTMLElement | null): Promise<boolean> {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      if (!fallbackTarget) return false;

      const selection = window.getSelection();
      if (!selection) return false;

      const range = document.createRange();
      range.selectNodeContents(fallbackTarget);
      selection.removeAllRanges();
      selection.addRange(range);
      fallbackTarget.focus({ preventScroll: true });

      return false;
    }
  }
}
