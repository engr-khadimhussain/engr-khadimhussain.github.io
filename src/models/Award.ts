export interface RawAward {
  logo: string;
  role: string;
  title: string;
  issuer: string;
  year: number | null;
  context: string;
  scan: string;
}

export class Award {
  private readonly raw: RawAward;

  constructor(raw: RawAward) {
    this.raw = raw;
  }

  get title(): string {
    return this.raw.title;
  }

  get issuer(): string {
    return this.raw.issuer;
  }

  get context(): string {
    return this.raw.context;
  }

  get logo(): string {
    return this.raw.logo;
  }

  get role(): string {
    return this.raw.role;
  }

  get scan(): string {
    return this.raw.scan;
  }

  get year(): number | null {
    return this.raw.year;
  }

  get label(): string {
    return this.raw.title;
  }

  get yearLabel(): string {
    return this.raw.year?.toString() ?? "Year not specified";
  }

  static from(raw: RawAward): Award {
    return new Award(raw);
  }
}
