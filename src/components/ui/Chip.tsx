import type { LucideIcon } from "lucide-react";

export interface ChipProps {
  icon?: LucideIcon;
  label: string;
  tone?: "accent" | "muted";
}

export function Chip({ icon: Icon, label, tone = "muted" }: ChipProps) {
  const toneClasses =
    tone === "accent"
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-line bg-bg text-muted";

  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneClasses}`}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
