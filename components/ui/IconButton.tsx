import { Pressable, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export function IconButton({
  icon,
  size = 22,
  color = theme.colors.textSecondary,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      hitSlop={8}
      style={{ padding: theme.spacing.xs }}
      {...props}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}
