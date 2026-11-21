import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import type { GalleryItem } from "../models/Profile";

export interface LightboxProps {
  items: readonly GalleryItem[];
  index: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function Lightbox({ items, index, onClose, onChangeIndex }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const isOpen = index !== null && items.length > 0;
  const currentItem = isOpen ? items[index] : null;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        onChangeIndex((index + 1) % items.length);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onChangeIndex((index - 1 + items.length) % items.length);
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, index, items.length, onClose, onChangeIndex]);

  if (!isOpen || !currentItem || index === null) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.caption || "Site photograph preview"}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/92 p-4 backdrop-blur-xs sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl border-2 border-line bg-surface shadow-xl"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-line bg-bg px-4 py-2.5 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-accent">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            {currentItem.tag && (
              <span className="border border-line bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                {currentItem.tag}
              </span>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="inline-flex h-8 w-8 items-center justify-center border border-line bg-surface text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Image Stage */}
        <div className="relative flex max-h-[70vh] items-center justify-center overflow-hidden bg-bg p-3 sm:p-5">
          <img
            src={currentItem.src}
            alt={currentItem.caption}
            className="max-h-[62vh] w-auto max-w-full object-contain"
          />

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onChangeIndex((index - 1 + items.length) % items.length)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 border border-line bg-surface/90 p-2 text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeIndex((index + 1) % items.length)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 border border-line bg-surface/90 p-2 text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption & Place */}
        <div className="flex flex-col gap-2 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm text-fg">{currentItem.caption}</p>
          {currentItem.place && (
            <span className="inline-flex shrink-0 items-center gap-1 border border-line bg-bg px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
              <MapPin className="h-3 w-3" />
              {currentItem.place}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
