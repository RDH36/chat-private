import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, type Colors } from "./colors";
import { font } from "./fonts";
import { spacing, radius } from "./spacing";

function buildTheme(colors: Colors, statusBar: "dark" | "light") {
  return { colors, spacing, radius, font, statusBar };
}

export const lightTheme = buildTheme(lightColors, "dark");
export const darkTheme = buildTheme(darkColors, "light");

export type Theme = ReturnType<typeof buildTheme>;

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "brume-theme-mode";

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  themeMode: "auto",
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "auto") {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  const isDark = useMemo(() => {
    if (themeMode === "auto") return systemScheme === "dark";
    return themeMode === "dark";
  }, [themeMode, systemScheme]);

  const value = useMemo(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      themeMode,
      setThemeMode,
    }),
    [isDark, themeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
