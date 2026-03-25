import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";

const REASON_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; titleKey: string; subtitleKey: string }> = {
  deleted: { icon: "trash-outline", titleKey: "expired.deletedTitle", subtitleKey: "expired.deletedSubtitle" },
  expired: { icon: "time-outline", titleKey: "expired.expiredTitle", subtitleKey: "expired.expiredSubtitle" },
  banned: { icon: "ban-outline", titleKey: "expired.bannedTitle", subtitleKey: "expired.bannedSubtitle" },
};

export default function ExpiredScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { theme } = useTheme();

  const config = REASON_CONFIG[reason ?? "expired"] ?? REASON_CONFIG.expired;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Ionicons name={config.icon} size={64} color={theme.colors.textMuted} style={{ marginBottom: 24 }} />
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
          {t(config.titleKey)}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: "center", marginBottom: 40 }}>
          {t(config.subtitleKey)}
        </Text>

        <Pressable
          onPress={() => router.replace("/")}
          style={{ backgroundColor: theme.colors.accent, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32 }}
        >
          <Text style={{ color: theme.colors.accentText, fontSize: 16, fontWeight: "bold" }}>
            {t("expired.createNew")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
