import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { impactLight } from "@/lib/haptics";
import { useTheme } from "@/lib/theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function QuizOption({ label, selected, onPress }: Props) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (selected) return;
    scale.value = withSpring(0.96, {}, () => {
      scale.value = withSpring(1);
    });
    impactLight();
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: selected
            ? theme.colors.accent
            : pressed
              ? theme.colors.bgTertiary
              : theme.colors.bgSecondary,
        })}
      >
        <Text
          style={{
            fontSize: theme.font.size.md,
            fontWeight: theme.font.weight.medium,
            color: selected ? theme.colors.accentText : theme.colors.text,
          }}
        >
          {label}
        </Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.accentText} />
        )}
      </Pressable>
    </Animated.View>
  );
}
