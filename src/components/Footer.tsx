import { ArrowUp } from "lucide-react";
import { profile } from "../models/Profile";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Footer() {
  const person = profile.person;
  const year = new Date().getFullYear();

  function backToTop(): void {
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-xl font-bold uppercase tracking-wide text-fg">
            {person.name}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {person.title}
          </p>
          <p className="mt-3 text-xs text-muted">
            © {year} {person.name}. Built with care for {person.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ThemeSwitcher />
          <button
            type="button"
            onClick={backToTop}
            className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Back to top
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
