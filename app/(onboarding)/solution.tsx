import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { SolutionTile } from "@/components/onboarding/SolutionTile";
import { useOnboardingContext, type EmpathyProfile } from "@/hooks/useOnboarding";
import { useTheme } from "@/lib/theme";

type TileData = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  subtitleKey: string;
};

const ALL_TILES: TileData[] = [
  { id: "ephemeral", icon: "timer-outline", titleKey: "onboarding.ephemeralTitle", subtitleKey: "onboarding.ephemeralSub" },
  { id: "anonymous", icon: "person-outline", titleKey: "onboarding.anonymousTitle", subtitleKey: "onboarding.anonymousSub" },
  { id: "locked", icon: "lock-closed-outline", titleKey: "onboarding.lockedTitle", subtitleKey: "onboarding.lockedSub" },
  { id: "rooms", icon: "chatbubbles-outline", titleKey: "onboarding.roomsTitle", subtitleKey: "onboarding.roomsSub" },
];

const ORDER_BY_PROFILE: Record<EmpathyProfile, string[]> = {
  watcher: ["locked", "anonymous", "ephemeral", "rooms"],
  exposed: ["anonymous", "locked", "rooms", "ephemeral"],
  ghost: ["ephemeral", "rooms", "locked", "anonymous"],
};

function getTilesForProfile(profile: EmpathyProfile): TileData[] {
  const order = ORDER_BY_PROFILE[profile];
  return order.map((id) => ALL_TILES.find((t) => t.id === id)!);
}

export default function SolutionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useOnboardingContext();
  const { theme } = useTheme();
  const tiles = getTilesForProfile(profile);

  return (
    <OnboardingShell step={3}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={{
            fontSize: theme.font.size.xxl,
            fontWeight: theme.font.weight.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          {t("onboarding.solutionTitle")}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            fontSize: theme.font.size.sm,
            color: theme.colors.textMuted,
            marginBottom: theme.spacing.xxl,
          }}
        >
          {t("onboarding.solutionSubtitle")}
        </Animated.Text>

        {tiles.map((tile, i) => (
          <SolutionTile
            key={tile.id}
            icon={tile.icon}
            title={t(tile.titleKey)}
            subtitle={t(tile.subtitleKey)}
            index={i}
          />
        ))}

        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
          <Pressable
            onPress={() => router.replace("/(onboarding)/wow")}
            style={({ pressed }) => ({
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.lg,
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: theme.colors.accentText, fontWeight: theme.font.weight.bold, fontSize: theme.font.size.md }}>
              {t("onboarding.tryIt")}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </OnboardingShell>
  );
}
