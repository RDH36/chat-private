export const fontFamilies = {
  light: "PlusJakartaSans_300Light",
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

export type FontWeight = keyof typeof fontFamilies;

export function fontStyle(weight: FontWeight = "regular") {
  return { fontFamily: fontFamilies[weight] } as const;
}

export const font = {
  family: fontFamilies,
  size: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weight: {
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "bold" as const,
  },
} as const;
