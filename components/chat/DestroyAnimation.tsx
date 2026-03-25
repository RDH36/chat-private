import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { notifyWarning } from "@/lib/haptics";
import { Particles } from "@/components/onboarding/Particles";

const SHAKE_DURATION = 400;
const DISSOLVE_DURATION = 800;

interface Props {
  children: React.ReactNode;
  onComplete: () => void;
  bubbleColor: string;
  particleColor: string;
}

export function DestroyAnimation({ children, onComplete, bubbleColor, particleColor }: Props) {
  const bubbleRef = useRef<View>(null);
  const shakeX = useSharedValue(0);
  const dissolve = useSharedValue(0);
  const scale = useSharedValue(1);
  const scatterY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const [particles, setParticles] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    notifyWarning();

    // Phase 1: Shake
    shakeX.value = withSequence(
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(8, { duration: 40 }),
      withTiming(-8, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(-4, { duration: 40 }),
      withTiming(10, { duration: 30 }),
      withTiming(-10, { duration: 30 }),
      withTiming(0, { duration: 30 }),
    );

    // Phase 2: Particles + Dissolve after shake
    const dissolveTimer = setTimeout(() => {
      if (bubbleRef.current) {
        bubbleRef.current.measureInWindow((_x, _y, w, h) => {
          if (w > 0) setParticles({ w, h });
        });
      }
      dissolve.value = withTiming(1, { duration: DISSOLVE_DURATION, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      scale.value = withSequence(
        withTiming(1.08, { duration: 150 }),
        withTiming(0.3, { duration: DISSOLVE_DURATION - 150, easing: Easing.in(Easing.cubic) }),
      );
      scatterY.value = withTiming(-40, { duration: DISSOLVE_DURATION, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(0, { duration: DISSOLVE_DURATION, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onComplete)();
      });
    }, SHAKE_DURATION);

    return () => clearTimeout(dissolveTimer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: scatterY.value },
      { translateX: shakeX.value },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => {
    const flash = interpolate(dissolve.value, [0, 0.15, 0.4, 1], [0, 0.6, 0.2, 0]);
    return { opacity: flash };
  });

  return (
    <View>
      <ReAnimated.View style={animStyle}>
        <View ref={bubbleRef}>
          {children}
          <ReAnimated.View
            style={[{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: bubbleColor, borderRadius: 20,
            }, flashStyle]}
            pointerEvents="none"
          />
        </View>
      </ReAnimated.View>
      {particles && (
        <View style={{ position: "absolute", top: -20, left: 0 }} pointerEvents="none">
          <Particles width={particles.w} height={particles.h} color={particleColor} />
        </View>
      )}
    </View>
  );
}
