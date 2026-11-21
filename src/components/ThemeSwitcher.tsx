import { themes } from "../theme/ThemeManager";
import { useTheme } from "../theme/useTheme";

export function ThemeSwitcher() {
  const current = useTheme();

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="Choose colour theme"
    >
      {themes.list().map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => themes.set(theme.id)}
          aria-label={`Switch to ${theme.name} theme`}
          aria-pressed={current === theme.id}
          title={theme.name}
          className={`h-7 w-7 rounded-full border-2 transition-all ${
            current === theme.id
              ? "border-fg ring-2 ring-accent ring-offset-2 ring-offset-bg"
              : "border-line hover:scale-110"
          }`}
          style={{ backgroundColor: theme.swatch }}
        />
      ))}
    </div>
  );
}
