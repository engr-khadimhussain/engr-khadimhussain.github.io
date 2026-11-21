import { profile } from "./Profile";
import type { Experience } from "./Experience";

export interface Organisation {
  name: string;
  short?: string;
  kind: "employer" | "client";
  count: number;
  countries: string[];
  firstYear: number;
  lastYear: number;
}

interface OrganisationRecord {
  name: string;
  short?: string;
  kind: "employer" | "client";
  count: number;
  countries: Set<string>;
  firstYear: number;
  lastYear: number;
}

export class CompanyDirectory {
  private readonly records = new Map<string, OrganisationRecord>();

  constructor(experiences: Experience[]) {
    for (const experience of experiences) {
      const assignments = new Map<
        string,
        { name: string; short?: string; kind: "employer" | "client" }
      >();

      const add = (value: string, kind: "employer" | "client") => {
        const parsed = this.normalise(value);
        if (!parsed) return;

        const key = parsed.name.toLowerCase();
        const existing = assignments.get(key);

        assignments.set(key, {
          ...parsed,
          kind: existing?.kind === "employer" || kind === "employer"
            ? "employer"
            : "client",
        });
      };

      add(experience.company, "employer");
      add(experience.client, "client");

      for (const project of experience.subProjects) {
        add(project.client, "client");
        add(project.endUser, "client");
      }

      for (const [key, organisation] of assignments) {
        this.addAssignment(key, organisation, experience);
      }
    }
  }

  employers(): Organisation[] {
    return this.filter("employer");
  }

  clients(): Organisation[] {
    return this.filter("client");
  }

  all(): Organisation[] {
    return this.filter();
  }

  private filter(kind?: Organisation["kind"]): Organisation[] {
    return Array.from(this.records.values())
      .filter((item) => !kind || item.kind === kind)
      .map((item) => ({
        name: item.name,
        ...(item.short ? { short: item.short } : {}),
        kind: item.kind,
        count: item.count,
        countries: [...item.countries].sort(),
        firstYear: item.firstYear,
        lastYear: item.lastYear,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private addAssignment(
    key: string,
    organisation: { name: string; short?: string; kind: Organisation["kind"] },
    experience: Experience,
  ): void {
    const year = experience.year;
    const record = this.records.get(key);

    if (record) {
      record.count += 1;
      record.kind =
        record.kind === "employer" || organisation.kind === "employer"
          ? "employer"
          : "client";
      record.countries.add(experience.country);
      record.firstYear = Math.min(record.firstYear, year);
      record.lastYear = Math.max(record.lastYear, year);
      if (!record.short && organisation.short) {
        record.short = organisation.short;
      }
      return;
    }

    this.records.set(key, {
      name: organisation.name,
      short: organisation.short,
      kind: organisation.kind,
      count: 1,
      countries: new Set([experience.country]),
      firstYear: year,
      lastYear: year,
    });
  }

  private normalise(
    value: string,
  ): { name: string; short?: string } | null {
    const cleaned = value.split(",")[0].trim();
    const match = cleaned.match(/\(([^)]+)\)/);
    const name = cleaned.replace(/\s*\([^)]+\)/g, "").trim();

    if (!name) return null;

    return {
      name,
      ...(match?.[1] ? { short: match[1].trim() } : {}),
    };
  }
}

export const companyDirectory = new CompanyDirectory(profile.experiences);
