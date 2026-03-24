import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const PARTICLE_COUNT = 24;
const DURATION = 1200;

type Props = {
  width: number;
  height: number;
  color?: string;
};

type ParticleConfig = {
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  size: number;
  delay: number;
  rotation: number;
  isFragment: boolean;
};

function generateParticles(w: number, h: number): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Particles originate from random positions across the bubble surface
    const startX = Math.random() * w;
    const startY = Math.random() * h;

    // Infinity War style: drift to the RIGHT and slightly UP (like ash in wind)
    const windAngle = -0.4 + Math.random() * 0.8; // mostly rightward
    const dist = 60 + Math.random() * 120;
    const driftX = Math.cos(windAngle) * dist + 30; // strong rightward bias
    const driftY = Math.sin(windAngle) * dist - 30; // upward bias

    // Mix of tiny dust and larger fragments
    const isFragment = Math.random() < 0.3;
    const size = isFragment ? 6 + Math.random() * 10 : 2 + Math.random() * 5;

    // Staggered delay — right side particles go first (dissolving edge)
    const edgeDelay = (startX / w) * 300;

    particles.push({
      startX,
      startY,
      driftX,
      driftY,
      size,
      delay: edgeDelay + Math.random() * 200,
      rotation: Math.random() * 540,
      isFragment,
    });
  }
  return particles;
}

function Particle({ config, color }: { config: ParticleConfig; color: string }) {
  const progress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withTiming(1, {
        duration: DURATION,
        easing: Easing.out(Easing.quad),
      }),
    );
    // Fragments linger longer before fading
    const fadeDelay = config.isFragment ? DURATION * 0.5 : DURATION * 0.3;
    fadeOut.value = withDelay(
      config.delay + fadeDelay,
      withTiming(0, {
        duration: DURATION - fadeDelay,
        easing: Easing.in(Easing.cubic),
      }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    // Decelerate movement (fast start, slow end)
    const easedP = p;
    const currentX = config.startX + config.driftX * easedP;
    const currentY = config.startY + config.driftY * easedP;
    // Fragments shrink as they travel, dust stays roughly same
    const sizeMultiplier = config.isFragment ? 1 - p * 0.6 : 1 - p * 0.3;

    return {
      position: "absolute" as const,
      left: currentX,
      top: currentY,
      width: config.size * Math.max(sizeMultiplier, 0.1),
      height: config.size * Math.max(sizeMultiplier, 0.1),
      borderRadius: config.isFragment ? 2 : config.size,
      backgroundColor: color,
      opacity: fadeOut.value,
      transform: [{ rotate: `${config.rotation * p}deg` }],
    };
  });

  return <Animated.View style={style} />;
}

export function Particles({ width, height, color = "#ffffff" }: Props) {
  const configs = useMemo(() => generateParticles(width, height), [width, height]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width + 200, // extra space for particles to fly out
        height: height + 120,
        marginTop: -40,
      }}
      pointerEvents="none"
    >
      {configs.map((c, i) => (
        <Particle key={i} config={c} color={color} />
      ))}
    </View>
  );
}
