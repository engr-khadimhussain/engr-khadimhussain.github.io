import { useSyncExternalStore } from "react";
import { themes, type ThemeId } from "./ThemeManager";

export function useTheme(): ThemeId {
  return useSyncExternalStore(
    themes.subscribe.bind(themes),
    () => themes.current,
    () => "steel",
  );
}
