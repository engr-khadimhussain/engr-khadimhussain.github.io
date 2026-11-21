import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  MessageCircle,
  MessagesSquare,
  Send,
  X,
} from "lucide-react";
import { profile } from "../models/Profile";
import { BuilderPrompt } from "../lib/BuilderPrompt";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
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

export function BuilderContact() {
  const builder = profile.builder;
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
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
    setCopied(false);

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

    const firstFocusable =
      cardRef.current?.querySelector<HTMLElement>(
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
      if (
        event.target instanceof Node &&
        !cardRef.current?.contains(event.target)
      ) {
        closeCard();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, closeCard]);

  const copyNumber = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(builder.whatsappDisplay);
      setCopied(true);
    } catch {
      setCopied(false);
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
            transform: translate(24px, -50%);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%);
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

      {/* Desktop edge tab */}
      <button
        ref={desktopTriggerRef}
        type="button"
        onClick={openCard}
        aria-label="Get a website like this"
        aria-expanded={isOpen}
        aria-controls="builder-contact-card"
        className="builder-pulse fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center border border-line bg-accent px-3 py-5 text-on-accent shadow-lg transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180">
          GET A WEBSITE LIKE THIS
        </span>
      </button>

      {/* Mobile floating action */}
      <button
        ref={mobileTriggerRef}
        type="button"
        onClick={openCard}
        aria-label="Contact Mustafa about building a website"
        aria-expanded={isOpen}
        aria-controls="builder-contact-card"
        className="builder-pulse fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-4 z-40 flex size-12 items-center justify-center rounded-full border border-line bg-accent text-on-accent shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
      >
        <MessageCircle size={23} />
      </button>

      {/* Mobile-only light dim; desktop remains completely undimmed */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-bg/30 md:hidden"
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <>
          <div
            id="builder-contact-card"
            ref={cardRef}
            role="dialog"
            aria-modal={false}
            aria-labelledby="builder-contact-title"
            className="builder-desktop-card fixed right-4 top-1/2 z-[70] hidden w-[min(390px,calc(100vw-2rem))] -translate-y-1/2 border border-line bg-surface/90 p-6 shadow-xl backdrop-blur-xl md:block"
          >
            <ContactCardContent
              builder={builder}
              whatsappUrl={whatsappUrl}
              copied={copied}
              onCopy={copyNumber}
              onClose={closeCard}
            />
          </div>

          <div
            className="builder-mobile-card fixed inset-x-0 bottom-0 z-[70] max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface/95 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="mb-5 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-muted/40" />
            </div>

            <div
              ref={cardRef}
              id="builder-contact-card-mobile"
              role="dialog"
              aria-modal={false}
              aria-labelledby="builder-contact-title-mobile"
            >
              <ContactCardContent
                builder={builder}
                whatsappUrl={whatsappUrl}
                copied={copied}
                onCopy={copyNumber}
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
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
  titleId?: string;
}

function ContactCardContent({
  builder,
  whatsappUrl,
  copied,
  onCopy,
  onClose,
  titleId = "builder-contact-title",
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
        <span className="select-all font-mono text-sm font-semibold tracking-wide text-fg">
          {builder.whatsappDisplay}
        </span>

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy WhatsApp number"
          className="flex size-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 bg-[#25D366] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <WhatsAppIcon size={19} />
          WhatsApp
        </a>

        <a
          href={builder.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 border border-line bg-bg/50 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <Send size={17} />
          Telegram
        </a>

        <a
          href={builder.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 border border-line bg-bg/50 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <MessagesSquare size={17} />
          Discord
        </a>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
        Usually replies within a day
      </p>
    </>
  );
}
