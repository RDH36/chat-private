import { View, Text } from "react-native";
import { useProfile } from "@/lib/identity";
import { theme } from "@/lib/theme";

interface MessageBubbleProps {
  text: string;
  senderId: string;
  isOwn: boolean;
}

export function MessageBubble({ text, senderId, isOwn }: MessageBubbleProps) {
  const { nickname } = useProfile(isOwn ? undefined : senderId);

  return (
    <View style={{ maxWidth: "80%", marginBottom: 8, alignSelf: isOwn ? "flex-end" : "flex-start" }}>
      {!isOwn && nickname && (
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 4, marginLeft: 8 }}>
          {nickname}
        </Text>
      )}
      <View
        style={{
          backgroundColor: isOwn ? theme.colors.bubbleOwn : theme.colors.bubbleOther,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomRightRadius: isOwn ? 4 : 20,
          borderBottomLeftRadius: isOwn ? 20 : 4,
        }}
      >
        <Text style={{ color: isOwn ? theme.colors.bubbleOwnText : theme.colors.bubbleOtherText, fontSize: 16 }}>
          {text}
        </Text>
      </View>
    </View>
  );
}
