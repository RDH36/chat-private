import { Pressable, Text, type PressableProps } from "react-native";
import { theme } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string }> = {
  primary: { bg: theme.colors.accent, text: theme.colors.accentText },
  secondary: { bg: theme.colors.bgSecondary, text: theme.colors.text },
  destructive: { bg: theme.colors.errorBg, text: theme.colors.error },
};

export function Button({
  label,
  variant = "primary",
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = VARIANT_STYLES[variant];

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
