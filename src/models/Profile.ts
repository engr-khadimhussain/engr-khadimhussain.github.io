import data from "../data/profile.json";
import { Award, type RawAward } from "./Award";
import { Experience, type RawExperience } from "./Experience";

export interface Person {
  name: string;
  title: string;
  yearsExperience: number;
  careerStart: number;
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  photo: string;
  summary: string;
  languages: string[];
  countries: string[];
}

export interface GalleryItem {
  src: string;
  caption: string;
  place: string;
  tag: string;
}

export class Profile {
  readonly person: Person = data.person;
  readonly services = data.services;

  readonly experiences = data.experience
    .map((item) => Experience.from(item as RawExperience))
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  readonly awards = data.awards.map((item) =>
    Award.from(item as RawAward),
  );

  readonly training: string[] = data.training;

  readonly gallery: GalleryItem[] = data.gallery;

  byCountry(): Map<string, Experience[]> {
    const result = new Map<string, Experience[]>();

    for (const experience of this.experiences) {
      const items = result.get(experience.country) ?? [];
      items.push(experience);
      result.set(experience.country, items);
    }

    return result;
  }

  companies(): string[] {
    return [...new Set(this.experiences.map((item) => item.company))];
  }

  decades(): { label: string; items: Experience[] }[] {
    const groups = new Map<string, Experience[]>();

    for (const experience of this.experiences) {
      const decade = `${Math.floor(experience.year / 10) * 10}s`;
      const items = groups.get(decade) ?? [];
      items.push(experience);
      groups.set(decade, items);
    }

    return Array.from(groups, ([label, items]) => ({ label, items })).sort(
      (a, b) => Number(b.label.slice(0, 4)) - Number(a.label.slice(0, 4)),
    );
  }

  stats(): {
    years: number;
    countries: number;
    projects: number;
    awards: number;
  } {
    return {
      years: this.person.yearsExperience,
      countries: new Set(this.experiences.map((item) => item.country)).size,
      projects: this.experiences.reduce(
        (total, item) => total + 1 + item.subProjects.length,
        0,
      ),
      awards: this.awards.length,
    };
  }
}

export const profile = new Profile();
