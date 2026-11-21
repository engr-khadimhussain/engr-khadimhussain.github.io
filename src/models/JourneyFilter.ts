import type { Experience } from "./Experience";

export type ExperienceTypeFilter = "all" | "project" | "turnaround";

export class JourneyFilter {
  readonly type: ExperienceTypeFilter;
  readonly country: string;

  constructor(type: ExperienceTypeFilter = "all", country: string = "all") {
    this.type = type;
    this.country = country;
  }

  apply(experiences: readonly Experience[]): Experience[] {
    return experiences.filter((exp) => {
      const matchesType =
        this.type === "all" ||
        (this.type === "turnaround" && (exp.type === "turnaround" || exp.isTurnaround)) ||
        (this.type === "project" && (exp.type === "project" || exp.type === "employer"));

      const matchesCountry =
        this.country === "all" || exp.country.toLowerCase() === this.country.toLowerCase();

      return matchesType && matchesCountry;
    });
  }

  static countries(experiences: readonly Experience[]): string[] {
    const unique = new Set<string>();
    for (const exp of experiences) {
      if (exp.country) unique.add(exp.country);
    }
    return Array.from(unique);
  }
}
