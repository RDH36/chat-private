import { View, Text } from "react-native";
import { theme } from "@/lib/theme";

type BadgeVariant = "default" | "warning" | "critical" | "success";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: theme.colors.bgSecondary, text: theme.colors.textSecondary },
  warning: { bg: theme.colors.warningBg, text: theme.colors.warning },
  critical: { bg: theme.colors.errorBg, text: theme.colors.error },
  success: { bg: theme.colors.bgSecondary, text: theme.colors.success },
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];

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
