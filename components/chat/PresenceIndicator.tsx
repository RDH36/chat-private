import { View, Text } from "react-native";
import { theme } from "@/lib/theme";

interface PresenceIndicatorProps {
  count: number;
}

export function PresenceIndicator({ count }: PresenceIndicatorProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{count} en ligne</Text>
    </View>
  );
}
