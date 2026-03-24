import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
      }}
    >
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        style={{
          flex: 1,
          color: theme.colors.text,
          paddingVertical: 12,
          paddingHorizontal: 8,
          fontSize: 15,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
