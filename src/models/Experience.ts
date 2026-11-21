export interface RawSubProject {
  client: string;
  project: string;
  role: string;
  endUser: string;
}

export interface RawExperience {
  company: string;
  client: string;
  country: string;
  project: string;
  role: string;
  start: string;
  end: string | null;
  type: "project" | "turnaround" | "employer";
  duties?: string;
  subProjects?: RawSubProject[];
}

export class Experience {
  private readonly raw: RawExperience;

  constructor(raw: RawExperience) {
    this.raw = raw;
  }

  get company(): string {
    return this.raw.company;
  }

  get client(): string {
    return this.raw.client;
  }

  get country(): string {
    return this.raw.country;
  }

  get project(): string {
    return this.raw.project;
  }

  get role(): string {
    return this.raw.role;
  }

  get type(): RawExperience["type"] {
    return this.raw.type;
  }

  get duties(): string | undefined {
    return this.raw.duties;
  }

  get startDate(): Date {
    return this.parseDate(this.raw.start);
  }

  get endDate(): Date | null {
    return this.raw.end ? this.parseDate(this.raw.end) : null;
  }

  get durationMonths(): number {
    const end = this.endDate ?? new Date();
    return Math.max(
      1,
      (end.getFullYear() - this.startDate.getFullYear()) * 12 +
        end.getMonth() -
        this.startDate.getMonth() +
        1,
    );
  }

  get periodLabel(): string {
    const start = this.formatDate(this.startDate);
    return this.endDate
      ? `${start} - ${this.formatDate(this.endDate)}`
      : start;
  }

  get year(): number {
    return this.startDate.getFullYear();
  }

  get isTurnaround(): boolean {
    return this.raw.type === "turnaround";
  }

  get subProjects(): RawSubProject[] {
    return this.raw.subProjects ?? [];
  }

  private parseDate(value: string): Date {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  static from(raw: RawExperience): Experience {
    return new Experience(raw);
  }
}
