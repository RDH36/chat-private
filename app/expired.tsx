import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";

export default function ExpiredScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();

  const isDeleted = reason === "deleted";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Ionicons name={isDeleted ? "trash-outline" : "time-outline"} size={64} color={theme.colors.textMuted} style={{ marginBottom: 24 }} />
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
          {isDeleted ? t("expired.deletedTitle") : t("expired.expiredTitle")}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: "center", marginBottom: 40 }}>
          {isDeleted ? t("expired.deletedSubtitle") : t("expired.expiredSubtitle")}
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
