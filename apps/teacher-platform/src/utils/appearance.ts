export type ThemePreference = "light" | "dark" | "system";
export type ColorScheme = "purple" | "blue" | "green" | "orange";

export const THEME_STORAGE_KEY = "efl.teacher.appearance.theme";
export const COLOR_STORAGE_KEY = "efl.teacher.appearance.color";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const isColorScheme = (value: string | null): value is ColorScheme =>
  value === "purple" || value === "blue" || value === "green" || value === "orange";

export const getStoredAppearance = () => {
  if (typeof window === "undefined") {
    return { theme: "dark" as ThemePreference, colorScheme: "purple" as ColorScheme };
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const storedColor = window.localStorage.getItem(COLOR_STORAGE_KEY);

  return {
    theme: isThemePreference(storedTheme) ? storedTheme : "dark",
    colorScheme: isColorScheme(storedColor) ? storedColor : "purple",
  };
};

export const resolveTheme = (preference: ThemePreference) => {
  if (preference !== "system") {
    return preference;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyAppearance = (appearance: {
  theme: ThemePreference;
  colorScheme: ColorScheme;
}) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = resolveTheme(appearance.theme);
  root.dataset.color = appearance.colorScheme;
};

export const saveAppearance = (appearance: {
  theme: ThemePreference;
  colorScheme: ColorScheme;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, appearance.theme);
  window.localStorage.setItem(COLOR_STORAGE_KEY, appearance.colorScheme);
};
