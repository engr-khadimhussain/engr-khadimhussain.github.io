import { ArrowUp, MessagesSquare, Send } from "lucide-react";
import { profile } from "../models/Profile";
import { ThemeSwitcher } from "./ThemeSwitcher";

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.52 0 .17 5.34.16 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.83 1.49h.01c6.58 0 11.92-5.35 11.93-11.93a11.84 11.84 0 0 0-3.52-8.44ZM12.1 21.82a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.23-.37a9.86 9.86 0 0 1-1.51-5.28c0-5.48 4.46-9.94 9.95-9.94a9.88 9.88 0 0 1 7.03 2.92 9.88 9.88 0 0 1 2.91 7.04c-.01 5.48-4.47 9.94-9.95 9.94Zm5.46-7.44c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function Footer() {
  const person = profile.person;
  const builder = profile.builder;
  const year = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${builder.whatsapp}?text=${encodeURIComponent(
    builder.whatsappMessage,
  )}`;

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

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Website developed by {builder.name}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-[10px] font-semibold tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
              aria-label={`WhatsApp ${builder.whatsappDisplay}`}
            >
              <WhatsAppIcon />
              {builder.whatsappDisplay}
            </a>

            <a
              href={builder.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Mustafa on Telegram"
              className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Send size={15} />
            </a>

            <a
              href={builder.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Mustafa on Discord"
              className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <MessagesSquare size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
