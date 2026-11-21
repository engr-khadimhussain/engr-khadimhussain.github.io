import type { GalleryItem } from "./Profile";

export interface AwardEntry {
  readonly title: string;
  readonly issuer: string;
  readonly year: number | null;
  readonly yearLabel: string;
  readonly context?: string;
  readonly scan?: string;
  readonly logo?: string;
  readonly role?: string;
}

export interface AwardsSummary {
  total: number;
  issuers: number;
  spanLabel: string;
}

export class AwardsOrganizer {
  private readonly awards: readonly AwardEntry[];

  constructor(awards: readonly AwardEntry[]) {
    this.awards = awards;
  }

  sorted(): AwardEntry[] {
    return [...this.awards].sort((a, b) => {
      if (a.year === null && b.year === null) return 0;
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return b.year - a.year;
    });
  }

  summary(): AwardsSummary {
    const sortedItems = this.sorted();
    const issuerSet = new Set<string>();
    const years: number[] = [];

    for (const item of sortedItems) {
      if (item.issuer) issuerSet.add(item.issuer.trim());
      if (item.year !== null && Number.isFinite(item.year)) {
        years.push(item.year);
      }
    }

    let spanLabel = "—";
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      spanLabel = minYear === maxYear ? String(minYear) : `${minYear} - ${maxYear}`;
    }

    return {
      total: sortedItems.length,
      issuers: issuerSet.size,
      spanLabel,
    };
  }

  toLightboxItems(orderedAwards: readonly AwardEntry[]): GalleryItem[] {
    return orderedAwards
      .filter((item): item is AwardEntry & { scan: string } => Boolean(item.scan))
      .map((item) => ({
        src: item.scan,
        caption: [item.title, item.issuer, item.yearLabel || (item.year ? String(item.year) : "")]
          .filter(Boolean)
          .join(" · "),
        place: item.issuer || "Certificate",
        tag: item.yearLabel || (item.year ? String(item.year) : "AWARD"),
      }));
  }
}
