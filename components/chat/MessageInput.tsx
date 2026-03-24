import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";

interface MessageInputProps {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.bg,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
      }}
    >
      <TextInput
        placeholder={t("room.messagePlaceholder")}
        placeholderTextColor={theme.colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
        style={{
          flex: 1,
          backgroundColor: theme.colors.inputBg,
          color: theme.colors.text,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          maxHeight: 100,
        }}
      />
      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        style={{
          backgroundColor: theme.colors.accent,
          opacity: text.trim() ? 1 : 0.3,
          borderRadius: 20,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-up" size={20} color={theme.colors.accentText} />
      </Pressable>
    </View>
  );
}
