import { useRef, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ModalSheet({ visible, onClose, title, children }: ModalSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateY.setValue(SCREEN_HEIGHT);
      onClose();
    });
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end", opacity: bgOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <Animated.View
          style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: theme.radius.xxl,
            borderTopRightRadius: theme.radius.xxl,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.xl,
            paddingBottom: Math.max(insets.bottom, 20) + theme.spacing.lg,
            maxHeight: "85%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 16,
            transform: [{ translateY }],
          }}
        >
          {/* Handle bar + Close */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: theme.spacing.xl }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.bgTertiary,
              }}
            />
            <Pressable
              onPress={handleClose}
              style={{ position: "absolute", right: 0 }}
            >
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {title && (
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.font.size.xl,
                fontWeight: theme.font.weight.bold,
                marginBottom: theme.spacing.xl,
              }}
            >
              {title}
            </Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
