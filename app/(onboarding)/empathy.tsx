import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { notifySuccess } from "@/lib/haptics";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useOnboardingContext, type EmpathyProfile } from "@/hooks/useOnboarding";
import { theme } from "@/lib/theme";

const PROFILE_CONFIG: Record<EmpathyProfile, { icon: keyof typeof Ionicons.glyphMap; titleKey: string; bodyKey: string }> = {
  watcher: { icon: "eye-off-outline", titleKey: "onboarding.watcherTitle", bodyKey: "onboarding.watcherBody" },
  exposed: { icon: "shield-outline", titleKey: "onboarding.exposedTitle", bodyKey: "onboarding.exposedBody" },
  ghost: { icon: "flash-outline", titleKey: "onboarding.ghostTitle", bodyKey: "onboarding.ghostBody" },
};

export default function EmpathyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useOnboardingContext();
  const [showContent, setShowContent] = useState(false);

  const config = PROFILE_CONFIG[profile];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
      notifySuccess();
    }, 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <OnboardingShell step={2}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        {!showContent ? (
          <Animated.View entering={FadeIn} style={{ alignItems: "center", gap: theme.spacing.lg }}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={{ fontSize: theme.font.size.lg, fontWeight: theme.font.weight.medium, color: theme.colors.textMuted, textAlign: "center" }}>
              {t("onboarding.analyzing")}
            </Text>
          </Animated.View>
        ) : (
          <View style={{ gap: theme.spacing.xl }}>
            <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: "center" }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.bgSecondary, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={config.icon} size={36} color={theme.colors.accent} />
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(150).duration(500)}
              style={{
                fontSize: theme.font.size.xxl,
                fontWeight: theme.font.weight.bold,
                color: theme.colors.text,
                textAlign: "center",
                lineHeight: 32,
              }}
            >
              {t(config.titleKey)}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(300).duration(500)}
              style={{
                fontSize: theme.font.size.md,
                color: theme.colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {t(config.bodyKey)}
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <Pressable
                onPress={() => router.replace("/(onboarding)/solution")}
                style={({ pressed }) => ({
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.radius.lg,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: theme.spacing.lg,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: theme.colors.accentText, fontWeight: theme.font.weight.bold, fontSize: theme.font.size.md }}>
                  {t("onboarding.empathyContinue")}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>
    </OnboardingShell>
  );
}
