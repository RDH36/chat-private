import { useState, useEffect } from "react";
import { View, Text, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";
import { IconButton } from "@/components/ui/IconButton";

interface RoomHeaderProps {
  roomId: string;
  roomName?: string | null;
  onlineCount: number;
  isCreator: boolean;
  onSettingsPress: () => void;
  expiryBadge: React.ReactNode;
  allowCodeSharing?: boolean;
}

export function RoomHeader({
  roomId,
  roomName,
  onlineCount,
  isCreator,
  onSettingsPress,
  expiryBadge,
  allowCodeSharing = true,
}: RoomHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomId);
    setCopied(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: t("room.shareMessage", { roomId }),
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View style={{ flexShrink: 1 }}>
            {roomName ? (
              <>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold" }} numberOfLines={1}>
                  {roomName}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11, letterSpacing: 2 }}>
                  {roomId}
                </Text>
              </>
            ) : (
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", letterSpacing: 3 }}>
                {roomId}
              </Text>
            )}
          </View>
          {allowCodeSharing && (
            <>
              <IconButton
                icon={copied ? "checkmark-outline" : "copy-outline"}
                size={18}
                color={copied ? theme.colors.success : theme.colors.textMuted}
                onPress={handleCopy}
              />
              <IconButton icon="share-outline" size={18} color={theme.colors.textMuted} onPress={handleShare} />
            </>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {expiryBadge}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{onlineCount}</Text>
          </View>

          <IconButton icon="settings-outline" onPress={onSettingsPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}
