import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.xl }}>
      <Ionicons
        name={icon}
        size={64}
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.spacing.xl }}
      />
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.font.size.xl,
          fontWeight: theme.font.weight.bold,
          textAlign: "center",
          marginBottom: theme.spacing.sm,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.font.size.md,
            textAlign: "center",
            marginBottom: theme.spacing.xxl,
          }}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} />
      )}
    </View>
  );
}
