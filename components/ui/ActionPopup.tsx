import { useRef, useEffect } from "react";
import { View, Text, Pressable, Modal, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export interface ActionOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionOption[];
}

export function ActionPopup({ visible, onClose, title, message, options }: ActionPopupProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const dismiss = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      translateY.setValue(SCREEN_HEIGHT);
      onClose();
      cb?.();
    });
  };

  const handleClose = () => dismiss();

  const handleOption = (opt: ActionOption) => dismiss(opt.onPress);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose} statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end", opacity: bgOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <Animated.View style={{
          backgroundColor: theme.colors.bg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: Math.max(insets.bottom, 16),
          transform: [{ translateY }],
        }}>
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.bgTertiary }} />
          </View>

          {(title || message) && (
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
              {title && (
                <Text style={{ fontSize: 17, fontWeight: theme.font.weight.semibold, color: theme.colors.text, marginBottom: message ? 4 : 0 }}>
                  {title}
                </Text>
              )}
              {message && (
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 }}>
                  {message}
                </Text>
              )}
            </View>
          )}

          {options.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => handleOption(opt)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: pressed ? theme.colors.bgSecondary : "transparent",
              })}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: opt.destructive ? theme.colors.errorBg : theme.colors.bgSecondary,
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={opt.destructive ? theme.colors.error : theme.colors.text}
                />
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: theme.font.weight.medium,
                color: opt.destructive ? theme.colors.error : theme.colors.text,
              }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
