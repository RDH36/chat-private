import { TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/lib/theme";

interface InputProps extends TextInputProps {
  centered?: boolean;
}

export function Input({ centered, style, ...props }: InputProps) {
  const { theme } = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[
        {
          backgroundColor: theme.colors.inputBg,
          color: theme.colors.text,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: 14,
          fontSize: theme.font.size.md,
          textAlign: centered ? "center" : undefined,
        },
        style as object,
      ]}
      {...props}
    />
  );
}
