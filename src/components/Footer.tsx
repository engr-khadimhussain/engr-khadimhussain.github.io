import { ArrowUp } from "lucide-react";
import {
  DiscordIcon,
  GmailIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./ui/BrandIcons";
import { profile } from "../models/Profile";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
              <WhatsAppIcon size={15} />
              {builder.whatsappDisplay}
            </a>

            <a
              href={builder.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message Mustafa on Telegram"
              className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <TelegramIcon size={16} />
            </a>

            <a
              href={builder.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message Mustafa on Discord"
              className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <DiscordIcon size={16} />
            </a>

            <a
              href={builder.gmail}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email Mustafa"
              className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <GmailIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
