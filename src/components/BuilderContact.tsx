import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Mail, MessageCircle, X } from "lucide-react";
import {
  DiscordIcon,
  GmailIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./ui/BrandIcons";
import { profile } from "../models/Profile";
import { BuilderPrompt } from "../lib/BuilderPrompt";

type CopyField = "whatsapp" | "email" | null;

export function BuilderContact() {
  const builder = profile.builder;
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<CopyField>(null);

  const desktopCardRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const whatsappUrl = `https://wa.me/${builder.whatsapp}?text=${encodeURIComponent(
    builder.whatsappMessage,
  )}`;

  const openCard = useCallback((): void => {
    BuilderPrompt.markSeen();
    setIsOpen(true);
  }, []);

  const closeCard = useCallback((): void => {
    setIsOpen(false);
    setCopied(null);

    requestAnimationFrame(() => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const trigger = desktop
        ? desktopTriggerRef.current
        : mobileTriggerRef.current;

      trigger?.focus();
    });
  }, []);

  useEffect(() => {
    if (BuilderPrompt.hasSeen()) return;

    return BuilderPrompt.watchBottom(() => {
      if (BuilderPrompt.hasSeen()) return;
      BuilderPrompt.markSeen();
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const activeCard = desktop
      ? desktopCardRef.current
      : mobileCardRef.current;

    const firstFocusable =
      activeCard?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCard();
      }
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) return;

      const clickedInside =
        desktopCardRef.current?.contains(event.target) ||
        mobileCardRef.current?.contains(event.target);

      if (!clickedInside) closeCard();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, closeCard]);

  const copyValue = async (
    value: string,
    field: Exclude<CopyField, null>,
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="print:hidden">
      <style>{`
        @keyframes builder-pulse {
          0%, 90%, 100% {
            box-shadow: 0 0 0 0 transparent;
          }
          94% {
            box-shadow: 0 0 0 5px color-mix(in srgb, var(--color-accent) 20%, transparent);
          }
          98% {
            box-shadow: 0 0 0 10px transparent;
          }
        }

        @keyframes builder-slide-desktop {
          from {
            opacity: 0;
            transform: translate(24px, 0);
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        @keyframes builder-slide-mobile {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .builder-pulse {
          animation: builder-pulse 8s ease-out infinite;
        }

        .builder-desktop-card {
          animation: builder-slide-desktop 0.3s ease-out both;
        }

        .builder-mobile-card {
          animation: builder-slide-mobile 0.3s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .builder-pulse,
          .builder-desktop-card,
          .builder-mobile-card {
            animation: none !important;
          }
        }
      `}</style>

      <button
        ref={desktopTriggerRef}
        type="button"
        onClick={openCard}
        aria-label="Get a website like this"
        aria-expanded={isOpen}
        aria-controls="builder-contact-card-desktop"
        className="builder-pulse fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center border border-line bg-accent px-3 py-5 text-on-accent shadow-lg transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
          GET A WEBSITE LIKE THIS
        </span>
      </button>

      <button
        ref={mobileTriggerRef}
        type="button"
        onClick={openCard}
        aria-label="Contact Mustafa about building a website"
        aria-expanded={isOpen}
        aria-controls="builder-contact-card-mobile"
        className="builder-pulse fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-4 z-40 flex size-12 items-center justify-center rounded-full border border-line bg-accent text-on-accent shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
      >
        <MessageCircle size={23} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-bg/30 md:hidden"
            aria-hidden="true"
          />

          <div
            id="builder-contact-card-desktop"
            ref={desktopCardRef}
            role="dialog"
            aria-modal={false}
            aria-labelledby="builder-contact-title-desktop"
            className="builder-desktop-card fixed right-4 top-20 z-[70] hidden max-h-[calc(100svh-96px)] w-[min(390px,calc(100vw-2rem))] -translate-y-0 overflow-y-auto border border-line bg-surface/90 p-6 shadow-xl backdrop-blur-xl md:block"
          >
            <ContactCardContent
              builder={builder}
              whatsappUrl={whatsappUrl}
              copied={copied}
              onCopy={copyValue}
              onClose={closeCard}
              titleId="builder-contact-title-desktop"
            />
          </div>

          <div className="builder-mobile-card fixed inset-x-0 bottom-0 z-[70] max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface/95 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-xl backdrop-blur-xl md:hidden">
            <div className="mb-5 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-muted/40" />
            </div>

            <div
              id="builder-contact-card-mobile"
              ref={mobileCardRef}
              role="dialog"
              aria-modal={false}
              aria-labelledby="builder-contact-title-mobile"
            >
              <ContactCardContent
                builder={builder}
                whatsappUrl={whatsappUrl}
                copied={copied}
                onCopy={copyValue}
                onClose={closeCard}
                titleId="builder-contact-title-mobile"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ContactCardContentProps {
  builder: typeof profile.builder;
  whatsappUrl: string;
  copied: CopyField;
  onCopy: (
    value: string,
    field: Exclude<CopyField, null>,
  ) => Promise<void>;
  onClose: () => void;
  titleId: string;
}

function ContactCardContent({
  builder,
  whatsappUrl,
  copied,
  onCopy,
  onClose,
  titleId,
}: ContactCardContentProps) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            Website development
          </p>
          <h2
            id={titleId}
            className="font-display text-2xl font-bold uppercase text-fg"
          >
            Like this website?
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact panel"
          className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        I build fast, modern portfolio and business websites.
      </p>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
        {builder.credit}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border border-line bg-bg/50 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <WhatsAppIcon size={17} className="shrink-0" />
          <span className="min-w-0 select-all break-all font-mono text-sm font-semibold tracking-wide text-fg">
            {builder.whatsappDisplay}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void onCopy(builder.whatsappDisplay, "whatsapp")}
          aria-label="Copy WhatsApp number"
          className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {copied === "whatsapp" ? (
            <Check size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border border-line bg-bg/50 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Mail size={16} className="shrink-0 text-muted" />
          <span className="min-w-0 select-all break-all font-mono text-xs text-fg">
            {builder.email}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void onCopy(builder.email, "email")}
          aria-label="Copy email address"
          className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {copied === "email" ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 bg-[#25D366] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <WhatsAppIcon size={16} color="currentColor" />
          WhatsApp
        </a>

        <div className="grid grid-cols-3 gap-2">
          <a
            href={builder.gmail}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Gmail compose"
            className="flex min-h-11 items-center justify-center gap-1.5 border border-line bg-bg/50 px-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wide text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <GmailIcon size={16} />
            Gmail
          </a>

          <a
            href={builder.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message Mustafa on Telegram"
            className="flex min-h-11 items-center justify-center gap-1.5 border border-line bg-bg/50 px-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wide text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <TelegramIcon size={16} />
            Telegram
          </a>

          <a
            href={builder.discord}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message Mustafa on Discord"
            className="flex min-h-11 items-center justify-center gap-1.5 border border-line bg-bg/50 px-2 py-3 font-mono text-[10px] font-bold uppercase tracking-wide text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <DiscordIcon size={16} />
            Discord
          </a>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        or use your{" "}
        <a
          href={`mailto:${builder.email}`}
          className="text-fg underline decoration-line underline-offset-4 transition-colors hover:text-accent"
        >
          mail app
        </a>
      </p>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
        Usually replies within a day
      </p>
    </>
  );
}
