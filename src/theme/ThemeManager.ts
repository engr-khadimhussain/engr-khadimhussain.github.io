export type ThemeId = "steel" | "flare" | "hydro" | "field";

export interface Theme {
  id: ThemeId;
  name: string;
  swatch: string;
}

type Listener = () => void;

export class ThemeManager {
  private readonly themes: Theme[] = [
    { id: "steel", name: "Pearl GTL Steel", swatch: "#F26B1D" },
    { id: "flare", name: "Flare Night", swatch: "#FFB020" },
    { id: "hydro", name: "Hydrotest Blue", swatch: "#0FA4BF" },
    { id: "field", name: "Oil Field Green", swatch: "#D7E23A" },
  ];

  private readonly listeners = new Set<Listener>();
  private active: ThemeId = "steel";

  constructor() {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("portfolio-theme");
      if (this.isTheme(saved)) this.active = saved;
    } catch {
      // Storage may be unavailable.
    }

    this.apply();
  }

  get current(): ThemeId {
    return this.active;
  }

  set(id: ThemeId): void {
    if (!this.isTheme(id) || id === this.active) return;

    this.active = id;
    this.apply();

    try {
      localStorage.setItem("portfolio-theme", id);
    } catch {
      // Theme still works without persistence.
    }

    this.listeners.forEach((listener) => listener());
  }

  list(): Theme[] {
    return this.themes.map((theme) => ({ ...theme }));
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private apply(): void {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = this.active;
    }
  }

  private isTheme(value: string | null): value is ThemeId {
    return this.themes.some((theme) => theme.id === value);
  }
}

export const themes = new ThemeManager();
