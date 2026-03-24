import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { RoomConfigSheet } from "@/components/sheets/RoomConfigSheet";
import { EmailLinkSheet } from "@/components/auth/EmailLinkSheet";
import { createRoom, type RoomConfig } from "@/lib/room";
import { useCurrentUser, useProfile } from "@/lib/identity";
import { db } from "@/lib/instant";
import { theme } from "@/lib/theme";

export function HomeHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showConfig, setShowConfig] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();
  const senderId = user?.id ?? "";
  const { nickname } = useProfile(user?.id);

  const handleCreateRoom = async (config: RoomConfig) => {
    setLoading(true);
    try {
      const roomId = await createRoom(senderId, config);
      router.push(`/chat/${roomId}`);
    } catch {
      setError(t("home.errorCreate"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await db.queryOnce({
        rooms: { $: { where: { roomId: code } } },
      });
      const room = data.rooms[0];
      if (!room) { setError(t("home.roomNotFound")); return; }
      if (room.deletedAt) { router.push("/expired?reason=deleted"); return; }
      if (room.expiresAt && room.expiresAt < Date.now()) { router.push("/expired?reason=expired"); return; }
      router.push(`/chat/${code}`);
    } catch {
      setError(t("home.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 24 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "bold" }}>{t("home.title")}</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Avatar + Pseudo */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.bgSecondary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18 }}>{nickname ? nickname.charAt(0).toUpperCase() : "?"}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>{nickname}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
              {user?.email ?? t("home.guest")}
            </Text>
          </View>
        </View>
        {!user?.email && (
          <Pressable
            onPress={() => setShowRecover(true)}
            style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600" }}>{t("home.login")}</Text>
          </Pressable>
        )}
      </View>

      {/* Actions */}
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pressable
          onPress={() => setShowConfig(true)}
          disabled={loading}
          style={{ backgroundColor: theme.colors.accent, borderRadius: 16, paddingVertical: 18, alignItems: "center" }}
        >
          <Text style={{ color: theme.colors.accentText, fontSize: 17, fontWeight: "bold" }}>{t("home.createRoom")}</Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={{ flex: 1, backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, textAlign: "center", fontSize: 16, letterSpacing: 3 }}
            placeholder={t("home.codePlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Pressable
            onPress={handleJoinRoom}
            disabled={loading || !joinCode.trim()}
            style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 12, paddingHorizontal: 20, justifyContent: "center", opacity: joinCode.trim() ? 1 : 0.4 }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>{t("home.join")}</Text>
          </Pressable>
        </View>

        {error ? (
          <Text style={{ color: theme.colors.error, textAlign: "center", fontSize: 14 }}>{error}</Text>
        ) : null}
      </View>

      <RoomConfigSheet visible={showConfig} onClose={() => setShowConfig(false)} onCreateRoom={handleCreateRoom} />
      <EmailLinkSheet
        visible={showRecover}
        onClose={() => setShowRecover(false)}
        title={t("home.login")}
        subtitle={t("home.loginSubtitle")}
      />
    </View>
  );
}
