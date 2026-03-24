import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentUser, useProfile } from "@/lib/identity";
import { theme } from "@/lib/theme";

const LANGUAGES = [
  { code: "fr", label: "Francais" },
  { code: "en", label: "English" },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { nickname } = useProfile(user?.id);

  const handleLanguageToggle = async () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem("language", next);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginLeft: 16 }}>
            {t("settings.title")}
          </Text>
        </View>

        {/* Avatar + pseudo */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.bgSecondary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 24 }}>{nickname ? nickname.charAt(0).toUpperCase() : "?"}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "600" }}>{nickname}</Text>
            {user?.email && (
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2 }}>{user.email}</Text>
            )}
          </View>
        </View>

        {/* Menu */}
        <View style={{ gap: 8 }}>
          <SettingsLink
            icon="person-outline"
            label={t("settings.profile")}
            subtitle={t("settings.nickname")}
            onPress={() => router.push("/settings/profile")}
          />
          <SettingsLink
            icon="lock-closed-outline"
            label={t("settings.security")}
            subtitle={t("settings.securitySubtitle")}
            onPress={() => router.push("/settings/security")}
          />
          <SettingsLink
            icon="mail-outline"
            label={t("settings.account")}
            subtitle={user?.email ? t("settings.accountProtected") : t("settings.accountGuest")}
            onPress={() => router.push("/settings/account")}
          />
          <SettingsLink
            icon="language-outline"
            label={t("settings.language")}
            subtitle={currentLang.label}
            onPress={handleLanguageToggle}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingsLink({ icon, label, subtitle, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.bgTertiary, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon} size={20} color={theme.colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "500" }}>{label}</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}
