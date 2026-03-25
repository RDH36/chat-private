import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useTheme } from "@/lib/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  index: number;
};

export function SolutionTile({ icon, title, subtitle, index }: Props) {
  const { theme } = useTheme();
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 120).duration(400)}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.spacing.lg,
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
      }}
    >
      <Ionicons name={icon} size={28} color={theme.colors.accent} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: theme.font.size.md, fontWeight: theme.font.weight.semibold, color: theme.colors.text, marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ fontSize: theme.font.size.sm, color: theme.colors.textSecondary, lineHeight: 20 }}>
          {subtitle}
        </Text>
      </View>
    </Animated.View>
  );
}
