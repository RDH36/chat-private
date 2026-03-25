import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";

interface TypingUser {
  senderName: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (typingUsers.length === 0) return null;

  const label =
    typingUsers.length === 1
      ? t("room.typingSingle", { name: typingUsers[0].senderName })
      : t("room.typingMultiple", {
          names: typingUsers.map((u) => u.senderName).join(", "),
        });

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.font.size.xs,
          fontStyle: "italic",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
