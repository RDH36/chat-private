import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { useCurrentUser, useProfile, saveNickname } from "@/lib/identity";
import { theme } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { nickname, profileId } = useProfile(user?.id);
  const [value, setValue] = useState(nickname);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const hasChanged = value.trim() !== nickname;

  const handleSave = async () => {
    if (!user?.id || !hasChanged) return;
    setSaving(true);
    setError("");
    const result = await saveNickname(user.id, value, profileId);
    setSaving(false);
    if (result.ok) {
      router.back();
    } else {
      setError(result.error ?? t("profile.error"));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </Pressable>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginLeft: 16 }}>
              {t("profile.title")}
            </Text>
          </View>

          <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            {t("profile.nickname")}
          </Text>
          <Input
            value={value}
            onChangeText={(v) => { setValue(v); setError(""); }}
            placeholder={t("profile.placeholder")}
            maxLength={20}
            autoFocus
          />
          {error ? (
            <Text style={{ color: theme.colors.error, fontSize: 13, marginTop: 6 }}>{error}</Text>
          ) : (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 6 }}>
              {t("profile.hint")}
            </Text>
          )}

          <View style={{ marginTop: 24 }}>
            <Button
              label={saving ? t("profile.saving") : t("profile.save")}
              onPress={handleSave}
              disabled={!hasChanged || saving}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
