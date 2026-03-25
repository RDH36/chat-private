import { Pressable, Text, type PressableProps } from "react-native";
import { useTheme } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const getVariantStyles = (colors: Record<string, string>) => ({
  primary: { bg: colors.accent, text: colors.accentText },
  secondary: { bg: colors.bgSecondary, text: colors.text },
  destructive: { bg: colors.errorBg, text: colors.error },
});

export function Button({
  label,
  variant = "primary",
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const variantStyles = getVariantStyles(theme.colors);
  const colors = variantStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      style={[
        {
          backgroundColor: colors.bg,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          alignItems: "center" as const,
          opacity: disabled ? 0.4 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style as object,
      ]}
      {...props}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: theme.font.size.md,
          fontWeight: theme.font.weight.bold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
