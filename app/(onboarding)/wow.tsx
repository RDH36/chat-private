import { useState, useCallback } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { impactLight } from "@/lib/haptics";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { DemoBubble, type ParticleBurst } from "@/components/onboarding/DemoBubble";
import { Particles } from "@/components/onboarding/Particles";
import { useOnboardingContext } from "@/hooks/useOnboarding";
import { useTheme } from "@/lib/theme";

type DemoMessage = { id: string; text: string };
const PARTICLE_LIFETIME = 2000;

export default function WowScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { markComplete } = useOnboardingContext();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState("");
  const [destroyedCount, setDestroyedCount] = useState(0);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);

  const handleParticles = useCallback((burst: ParticleBurst) => {
    setBursts((prev) => [...prev, burst]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burst.id));
    }, PARTICLE_LIFETIME);
  }, []);

  const suggestions = [
    t("onboarding.suggestion1"),
    t("onboarding.suggestion2"),
    t("onboarding.suggestion3"),
  ];

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const msg: DemoMessage = { id: Date.now().toString(), text: text.trim() };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    impactLight();
  }, []);

  const handleDestroyed = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDestroyedCount((c) => c + 1);
  }, []);

  const handleEnter = async () => {
    await markComplete();
    router.replace("/");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
          <ProgressBar step={4} total={4} />
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
          <Text style={{ fontSize: theme.font.size.xxl, fontWeight: theme.font.weight.bold, color: theme.colors.text }}>
            {t("onboarding.wowTitle")}
          </Text>
          <Text style={{ fontSize: theme.font.size.sm, color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
            {t("onboarding.wowHint")}
          </Text>
        </View>

        {/* Chat area */}
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.xl, justifyContent: "flex-end" }}>
          {messages.map((msg) => (
            <DemoBubble key={msg.id} text={msg.text} onDestroyed={() => handleDestroyed(msg.id)} onParticles={handleParticles} />
          ))}
        </View>

        {/* Suggestions */}
        {messages.length === 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.md }}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => sendMessage(s)}
                style={({ pressed }) => ({
                  borderRadius: theme.radius.full,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  backgroundColor: pressed ? theme.colors.bgTertiary : theme.colors.bgSecondary,
                })}
              >
                <Text style={{ fontSize: theme.font.size.sm, color: theme.colors.textSecondary }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, gap: theme.spacing.sm }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("onboarding.wowPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            style={{
              flex: 1,
              backgroundColor: theme.colors.inputBg,
              borderRadius: theme.radius.full,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              fontSize: theme.font.size.md,
              color: theme.colors.text,
            }}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="arrow-up" size={20} color={theme.colors.accentText} />
          </Pressable>
        </View>

        {/* Enter Brume button */}
        {destroyedCount > 0 && (
          <Animated.View entering={FadeInDown.duration(500)} style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
            <Pressable
              onPress={handleEnter}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radius.lg,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: theme.colors.accentText, fontWeight: theme.font.weight.bold, fontSize: theme.font.size.md }}>
                {t("onboarding.enterBrume")}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Particle overlay — fullscreen, above everything, not clipped */}
      {bursts.map((burst) => (
        <View
          key={burst.id}
          style={{ position: "absolute", left: burst.x, top: burst.y, width: 0, height: 0 }}
          pointerEvents="none"
        >
          <Particles width={burst.width} height={burst.height} color={theme.colors.accent} />
        </View>
      ))}
    </SafeAreaView>
  );
}
