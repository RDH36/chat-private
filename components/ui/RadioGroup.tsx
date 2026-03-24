import { View, Text, Pressable } from "react-native";
import { theme } from "@/lib/theme";

interface RadioOption<T extends string> {
  label: string;
  value: T;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function RadioGroup<T extends string>({
  options,
  selected,
  onSelect,
}: RadioGroupProps<T>) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: theme.radius.full,
              backgroundColor: isSelected ? theme.colors.accent : theme.colors.bgSecondary,
            }}
          >
            <Text
              style={{
                color: isSelected ? theme.colors.accentText : theme.colors.text,
                fontSize: theme.font.size.sm,
                fontWeight: isSelected ? theme.font.weight.semibold : theme.font.weight.normal,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
