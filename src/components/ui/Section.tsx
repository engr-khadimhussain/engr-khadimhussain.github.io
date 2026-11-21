import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  children,
}: SectionProps) {
  return (
    <section id={id} className="px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide text-fg md:text-6xl">
            {title}
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
}
