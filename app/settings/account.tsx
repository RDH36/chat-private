import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/lib/identity";
import { theme } from "@/lib/theme";
import { EmailLinkSheet } from "@/components/auth/EmailLinkSheet";

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [showEmailLink, setShowEmailLink] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginLeft: 16 }}>
            {t("account.title")}
          </Text>
        </View>

        {!user?.email ? (
          <View style={{ gap: 16 }}>
            <View style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 14, padding: 16 }}>
              <Ionicons name="warning-outline" size={24} color={theme.colors.warning} style={{ marginBottom: 8 }} />
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                {t("account.guestTitle")}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                {t("account.guestWarning")}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowEmailLink(true)}
              style={{ backgroundColor: theme.colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ color: theme.colors.accentText, fontSize: 16, fontWeight: "bold" }}>
                {t("account.protectAccount")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 14, padding: 16, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
                {t("account.protectedTitle")}
              </Text>
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              {user.email}
            </Text>
          </View>
        )}
      </View>

      <EmailLinkSheet
        visible={showEmailLink}
        onClose={() => setShowEmailLink(false)}
      />
    </SafeAreaView>
  );
}
