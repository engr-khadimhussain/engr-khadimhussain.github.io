import { useState } from "react";
import { slug, initials } from "../../lib/text";

interface CompanyLogoProps {
  name: string;
  size: "sm" | "lg";
}

export function CompanyLogo({ name, size }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const large = size === "lg";

  return (
    <div
      className={`group flex shrink-0 items-center justify-center border border-line bg-plate transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        large ? "h-16 w-[120px] p-2" : "h-12 w-12 p-1"
      }`}
      title={name}
    >
      {!failed ? (
        <img
          src={`/logos/${slug(name)}.png`}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span
          aria-label={name}
          className="font-display text-xl font-bold uppercase text-plate-ink"
        >
          {initials(name, 2)}
        </span>
      )}
    </div>
  );
}
