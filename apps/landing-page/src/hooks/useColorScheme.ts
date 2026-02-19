import { useState, useEffect } from "react";

type ColorScheme = "light" | "dark";

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setColorScheme(e.matches ? "dark" : "light");
    };

    updateScheme(mediaQuery);
    mediaQuery.addEventListener("change", updateScheme);

    return () => mediaQuery.removeEventListener("change", updateScheme);
  }, []);

  return colorScheme;
}
