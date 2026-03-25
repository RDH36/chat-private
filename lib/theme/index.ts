export { lightColors, darkColors } from "./colors";
export type { Colors } from "./colors";
export { fontFamilies, fontStyle, font } from "./fonts";
export type { FontWeight } from "./fonts";
export { spacing, radius } from "./spacing";
export { ThemeProvider, useTheme, lightTheme, darkTheme } from "./ThemeProvider";
export type { Theme } from "./ThemeProvider";

import { lightTheme } from "./ThemeProvider";

// Backward compat: static theme for non-React code
export const theme = lightTheme;
