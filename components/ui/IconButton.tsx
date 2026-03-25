import { Pressable, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export function IconButton({
  icon,
  size = 22,
  color,
  ...props
}: IconButtonProps) {
  const { theme } = useTheme();
  const iconColor = color ?? theme.colors.textSecondary;
  return (
    <Pressable
      hitSlop={8}
      style={{ padding: theme.spacing.xs }}
      {...props}
    >
      <Ionicons name={icon} size={size} color={iconColor} />
    </Pressable>
  );
}
