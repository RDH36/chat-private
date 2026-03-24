import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";

interface RoomCardProps {
  room: {
    roomId: string;
    name?: string | null;
    isPublic?: boolean;
    creatorId: string;
    expiresAt?: number | null;
  };
  senderId: string;
  onPress: () => void;
}

export function RoomCard({ room, senderId, onPress }: RoomCardProps) {
  const { t } = useTranslation();
  const displayName = room.name || room.roomId;
  const isCreator = room.creatorId === senderId;

  const formatTimeLeft = (expiresAt: number | null | undefined) => {
    if (!expiresAt) return t("room.noExpiration");
    const diff = expiresAt - Date.now();
    if (diff <= 0) return t("room.expired");
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h > 0) return t("room.timeLeftHM", { h, m });
    return t("room.timeLeftM", { m });
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {!room.isPublic && (
            <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} />
          )}
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "bold",
            }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          {room.name && (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, letterSpacing: 1.5 }}>
              {room.roomId}
            </Text>
          )}
          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
            {formatTimeLeft(room.expiresAt)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {isCreator && (
          <View style={{ backgroundColor: theme.colors.bgTertiary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: "600" }}>{t("room.creator")}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}
