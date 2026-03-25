import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme";

type BadgeVariant = "default" | "warning" | "critical" | "success";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const getVariantStyles = (colors: Record<string, string>) => ({
  default: { bg: colors.bgSecondary, text: colors.textSecondary },
  warning: { bg: colors.warningBg, text: colors.warning },
  critical: { bg: colors.errorBg, text: colors.error },
  success: { bg: colors.bgSecondary, text: colors.success },
});

export function Badge({ label, variant = "default" }: BadgeProps) {
  const { theme } = useTheme();
  const variantStyles = getVariantStyles(theme.colors);
  const colors = variantStyles[variant];

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: theme.font.size.xs,
          fontWeight: theme.font.weight.semibold,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
