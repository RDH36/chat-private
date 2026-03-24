import { View } from "react-native";
import { EaseView } from "react-native-ease";
import { theme } from "@/lib/theme";

interface PinDotsProps {
  length: number;
  filled: number;
  shaking: boolean;
}

export function PinDots({ length, filled, shaking }: PinDotsProps) {
  return (
    <EaseView
      animate={{ translateX: shaking ? 10 : 0 }}
      transition={{ type: "spring", damping: 4, stiffness: 400, mass: 0.5 }}
    >
      <View style={{ flexDirection: "row", gap: 16, justifyContent: "center", marginVertical: 32 }}>
        {Array.from({ length }).map((_, i) => (
          <EaseView
            key={i}
            animate={{
              scale: i < filled ? 1 : 0.6,
              opacity: i < filled ? 1 : 0.3,
            }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            <View
              style={
                i < filled
                  ? { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.pinDotFilled }
                  : { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.pinDotEmpty }
              }
            />
          </EaseView>
        ))}
      </View>
    </EaseView>
  );
}
