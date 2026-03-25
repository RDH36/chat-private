import { useEffect, useState, useRef, useCallback } from "react";
import { View, Image, Pressable, FlatList, Modal, Animated, Dimensions, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { suppressLock, unsuppressLock } from "@/hooks/useLockState";
import { useTheme } from "@/lib/theme";

const SCREEN = Dimensions.get("window");
const COLS = 3;
const GAP = 2;
const THUMB_SIZE = (SCREEN.width - GAP * (COLS + 1)) / COLS;
const SHEET_MIN = SCREEN.height * 0.45;
const PAGE_SIZE = 30;

interface GalleryPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (uri: string) => void;
  onCamera: () => void;
}

export function GalleryPicker({ visible, onClose, onSelect, onCamera }: GalleryPickerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [permGranted, setPermGranted] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN.height)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    suppressLock();
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        setPermGranted(true);
        loadMore(true);
      }
    })();
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 22, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const loadMore = useCallback(async (reset = false) => {
    if (!reset && !hasMore) return;
    const page = await MediaLibrary.getAssetsAsync({
      first: PAGE_SIZE,
      after: reset ? undefined : endCursor,
      sortBy: [MediaLibrary.SortBy.creationTime],
      mediaType: [MediaLibrary.MediaType.photo],
    });
    setAssets((prev) => reset ? page.assets : [...prev, ...page.assets]);
    setEndCursor(page.endCursor);
    setHasMore(page.hasNextPage);
  }, [endCursor, hasMore]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN.height, duration: 200, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      translateY.setValue(SCREEN.height);
      setAssets([]);
      setEndCursor(undefined);
      setHasMore(true);
      unsuppressLock();
      onClose();
    });
  };

  const handleSelect = (uri: string) => {
    close();
    setTimeout(() => onSelect(uri), 250);
  };

  const handleCamera = () => {
    close();
    setTimeout(onCamera, 250);
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={close} statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: theme.colors.overlay, opacity: bgOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={close} />

        <Animated.View style={{
          backgroundColor: theme.colors.bg,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          height: SHEET_MIN,
          paddingBottom: insets.bottom,
          transform: [{ translateY }],
        }}>
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 8 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.bgTertiary }} />
          </View>

          {!permGranted ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Permission required</Text>
            </View>
          ) : (
            <FlatList
              data={[{ type: "camera" as const }, ...assets.map((a) => ({ type: "photo" as const, asset: a }))]}
              numColumns={COLS}
              keyExtractor={(item, i) => item.type === "camera" ? "cam" : `${item.asset.id}-${i}`}
              onEndReached={() => loadMore()}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{ paddingHorizontal: GAP }}
              renderItem={({ item }) => {
                if (item.type === "camera") {
                  return (
                    <Pressable onPress={handleCamera} style={{
                      width: THUMB_SIZE, height: THUMB_SIZE, margin: GAP / 2,
                      backgroundColor: theme.colors.bgSecondary, borderRadius: 4,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name="camera" size={28} color={theme.colors.textMuted} />
                    </Pressable>
                  );
                }
                return (
                  <Pressable onPress={() => handleSelect(item.asset.uri)} style={{ margin: GAP / 2 }}>
                    <Image source={{ uri: item.asset.uri }} style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 4 }} />
                  </Pressable>
                );
              }}
            />
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
