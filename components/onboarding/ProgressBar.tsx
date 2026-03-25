import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "@/lib/theme";

type Props = { step: number; total: number };

export function ProgressBar({ step, total }: Props) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(step / total, { duration: 400 });
  }, [step, total]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={{ height: 3, backgroundColor: theme.colors.bgTertiary, borderRadius: 2, marginBottom: theme.spacing.xl }}>
      <Animated.View
        style={[{ height: "100%", backgroundColor: theme.colors.accent, borderRadius: 2 }, barStyle]}
      />
    </View>
  );
}
