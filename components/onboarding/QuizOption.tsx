import { Pressable, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { impactLight } from "@/lib/haptics";
import { theme } from "@/lib/theme";

type Props = {
  label: string;
  onPress: () => void;
};

export function QuizOption({ label, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.96, {}, () => {
      scale.value = withSpring(1);
    });
    impactLight();
    setTimeout(onPress, 200);
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: pressed ? theme.colors.bgSecondary : theme.colors.bg,
        })}
      >
        <Text style={{ fontSize: theme.font.size.md, fontWeight: theme.font.weight.medium, color: theme.colors.text }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
