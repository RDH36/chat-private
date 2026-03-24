import { useEffect, useState, useRef } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { notifyWarning } from "@/lib/haptics";
import { theme } from "@/lib/theme";

const LIVE_DURATION = 3000;
const APPEAR_DURATION = 400;

// Destruction is multi-phase: shake → glitch → dissolve
const SHAKE_DURATION = 400;
const DISSOLVE_DURATION = 800;

export type ParticleBurst = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  text: string;
  onDestroyed: () => void;
  onParticles?: (burst: ParticleBurst) => void;
};

export function DemoBubble({ text, onDestroyed, onParticles }: Props) {
  const bubbleRef = useRef<View>(null);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const translateY = useSharedValue(16);
  const countdownWidth = useSharedValue(1);

  const shakeX = useSharedValue(0);
  const glitchOffset = useSharedValue(0);
  const dissolve = useSharedValue(0);
  const scatterY = useSharedValue(0);

  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Phase 1: Appear with spring
    opacity.value = withSpring(1, { damping: 12, stiffness: 100 });
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 });

    // Countdown bar shrinks during live phase
    countdownWidth.value = withDelay(
      APPEAR_DURATION,
      withTiming(0, { duration: LIVE_DURATION, easing: Easing.linear }),
    );

    // Warning flash at 80% countdown
    const warningTimeout = setTimeout(() => {
      setIsWarning(true);
    }, APPEAR_DURATION + LIVE_DURATION * 0.8);

    // Phase 2: Destruction sequence starts
    const destroyStart = APPEAR_DURATION + LIVE_DURATION;

    const hapticTimeout = setTimeout(() => {
      notifyWarning();
    }, destroyStart);

    // Shake violently
    const shakeTimeout = setTimeout(() => {
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
      glitchOffset.value = withSequence(
        withTiming(3, { duration: 60 }),
        withTiming(-2, { duration: 60 }),
        withTiming(4, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }, destroyStart);

    // Phase 3: Particles + Dissolve
    const dissolveStart = destroyStart + SHAKE_DURATION;
    const particleTimeout = setTimeout(() => {
      if (onParticles && bubbleRef.current) {
        bubbleRef.current.measureInWindow((x, y, w, h) => {
          if (w > 0) onParticles({ id: Date.now().toString(), x, y, width: w, height: h });
        });
      }
    }, dissolveStart);
    const dissolveTimeout = setTimeout(() => {
      dissolve.value = withTiming(1, {
        duration: DISSOLVE_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withSequence(
        withTiming(1.08, { duration: 150 }),
        withTiming(0.3, { duration: DISSOLVE_DURATION - 150, easing: Easing.in(Easing.cubic) }),
      );
      scatterY.value = withTiming(-40, {
        duration: DISSOLVE_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: DISSOLVE_DURATION,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) runOnJS(onDestroyed)();
      });
    }, dissolveStart);

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(hapticTimeout);
      clearTimeout(shakeTimeout);
      clearTimeout(particleTimeout);
      clearTimeout(dissolveTimeout);
    };
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value + scatterY.value },
      { translateX: shakeX.value },
    ],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${countdownWidth.value * 100}%`,
  }));

  // Glitch text effect — slight horizontal offset
  const textGlitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glitchOffset.value }],
  }));

  // Dissolve overlay — white flash that fades in then out
  const dissolveOverlayStyle = useAnimatedStyle(() => {
    const flash = interpolate(dissolve.value, [0, 0.15, 0.4, 1], [0, 0.6, 0.2, 0]);
    return { opacity: flash };
  });

  return (
    <Animated.View
      style={[
        {
          alignSelf: "flex-end",
          maxWidth: "80%",
          marginBottom: theme.spacing.sm,
        },
        bubbleStyle,
      ]}
    >
      <View
        ref={bubbleRef}
        style={{
          backgroundColor: theme.colors.bubbleOwn,
          borderRadius: 20,
          borderBottomRightRadius: 4,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 6,
        }}
      >
        <Animated.View style={textGlitchStyle}>
          <Text style={{ color: theme.colors.bubbleOwnText, fontSize: 16, marginBottom: 6 }}>
            {text}
          </Text>
        </Animated.View>

        {/* Countdown bar */}
        <View
          style={{
            height: 2,
            backgroundColor: isWarning ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.15)",
            borderRadius: 1,
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                backgroundColor: isWarning ? theme.colors.error : "rgba(255,255,255,0.5)",
                borderRadius: 1,
              },
              barStyle,
            ]}
          />
        </View>

        {/* Flash overlay on dissolve */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#ffffff",
              borderRadius: 20,
            },
            dissolveOverlayStyle,
          ]}
          pointerEvents="none"
        />
      </View>

    </Animated.View>
  );
}
