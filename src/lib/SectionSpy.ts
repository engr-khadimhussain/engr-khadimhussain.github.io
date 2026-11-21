export class SectionSpy {
  private readonly observer: IntersectionObserver;

  constructor(onChange: (sectionId: string) => void) {
    const visibleSections = new Map<string, number>();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;

          if (entry.isIntersecting) {
            visibleSections.set(id, entry.boundingClientRect.top);
          } else {
            visibleSections.delete(id);
          }
        }

        const active = [...visibleSections.entries()].sort(
          (first, second) => Math.abs(first[1]) - Math.abs(second[1]),
        )[0];

        if (active) onChange(active[0]);
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      },
    );

    document.querySelectorAll<HTMLElement>(
      "#home, #services, #journey, #onsite, #companies, #awards, #contact",
    ).forEach((section) => this.observer.observe(section));
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}
