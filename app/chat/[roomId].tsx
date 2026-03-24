import { useEffect, useState, useRef, useCallback } from "react";
import { View, FlatList, Text, TextInput, Pressable, Keyboard, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { isRoomActive, verifyRoomPassword, deleteRoom, joinRoom, type MessageExpiry } from "@/lib/room";
import { useCurrentUser, useProfile } from "@/lib/identity";
import { useMessages } from "@/hooks/useMessages";
import { usePresence } from "@/hooks/usePresence";
import { useExpiry } from "@/hooks/useExpiry";
import { useReadReceipts } from "@/hooks/useReadReceipts";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { RoomHeader } from "@/components/chat/RoomHeader";
import { Badge } from "@/components/ui/Badge";
import { RoomSettingsSheet } from "@/components/sheets/RoomSettingsSheet";
import { theme } from "@/lib/theme";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatScreen() {
  const { t } = useTranslation();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const { user } = useCurrentUser();
  const senderId = user?.id ?? "";
  const { nickname: senderName } = useProfile(user?.id);
  const [roomDbId, setRoomDbId] = useState<string>();
  const [roomData, setRoomData] = useState<{
    name: string | null;
    isPublic: boolean;
    creatorId: string;
    expiresAt: number | null;
    messageExpiry: MessageExpiry;
    passwordHash: string | null;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const roomQuery = db.useQuery({
    rooms: { $: { where: { roomId: roomId! } } },
  });

  useEffect(() => {
    const room = roomQuery.data?.rooms[0];
    if (!room) return;

    if (!isRoomActive(room)) {
      const reason = room.deletedAt ? "deleted" : "expired";
      deleteRoom(room.id);
      router.replace(`/expired?reason=${reason}`);
      return;
    }

    if (room.passwordHash && !roomDbId) {
      setNeedsPassword(true);
      setRoomData({
        name: room.name ?? null,
        isPublic: room.isPublic ?? false,
        creatorId: room.creatorId,
        expiresAt: room.expiresAt ?? null,
        messageExpiry: room.messageExpiry as MessageExpiry,
        passwordHash: room.passwordHash ?? null,
      });
      return;
    }

    if (!roomDbId) {
      setRoomDbId(room.id);
      if (senderId) joinRoom(room.id, senderId, room.members);
    }
    setRoomData({
      name: room.name ?? null,
      isPublic: room.isPublic ?? false,
      creatorId: room.creatorId,
      expiresAt: room.expiresAt ?? null,
      messageExpiry: room.messageExpiry as MessageExpiry,
      passwordHash: room.passwordHash ?? null,
    });
  }, [roomQuery.data?.rooms, router, roomDbId, senderId]);

  const handlePasswordSubmit = () => {
    if (!roomData?.passwordHash) return;
    if (verifyRoomPassword(passwordInput, roomData.passwordHash)) {
      setNeedsPassword(false);
      const room = roomQuery.data?.rooms[0];
      if (room) setRoomDbId(room.id);
    } else {
      setPasswordError(t("room.wrongPassword"));
      setPasswordInput("");
    }
  };

  const { messages, sendMessage, isLoading } = useMessages(roomDbId);
  const { onlineCount } = usePresence(roomId!, { senderId, senderName });
  const { formatted, urgency, isExpired } = useExpiry(roomData?.expiresAt);
  const { markAsRead } = useReadReceipts(
    roomData?.messageExpiry ?? "never",
    onlineCount
  );

  useEffect(() => {
    if (isExpired) router.replace("/expired?reason=expired");
  }, [isExpired, router]);

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text, senderId, senderName);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [sendMessage, senderId, senderName]
  );

  const handleViewableChange = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: (typeof messages)[number] }> }) => {
      if (!senderId) return;
      for (const { item } of viewableItems) {
        if (item.senderId !== senderId) markAsRead(item, senderId);
      }
    },
    [senderId, markAsRead]
  );

  if (needsPassword) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
          {t("room.protected")}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginBottom: 24 }}>
          {t("room.enterPassword")}
        </Text>
        <TextInput
          placeholder={t("room.password")}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={passwordInput}
          onChangeText={setPasswordInput}
          onSubmitEditing={handlePasswordSubmit}
          style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, width: "100%", textAlign: "center", marginBottom: 12 }}
        />
        {passwordError ? (
          <Text style={{ color: theme.colors.error, fontSize: 14, marginBottom: 12 }}>{passwordError}</Text>
        ) : null}
        <Pressable
          onPress={handlePasswordSubmit}
          style={{ backgroundColor: theme.colors.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: theme.colors.accentText, fontWeight: "bold" }}>{t("room.enter")}</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || !roomData || !senderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        {/* Header skeleton */}
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Skeleton width={28} height={28} borderRadius={14} />
            <Skeleton width="40%" height={18} borderRadius={6} />
            <Skeleton width={28} height={28} borderRadius={14} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Skeleton width={100} height={12} borderRadius={4} />
          </View>
        </View>
        {/* Messages skeleton */}
        <View style={{ flex: 1, padding: 16, justifyContent: "flex-end", gap: 12 }}>
          <View style={{ alignSelf: "flex-start", gap: 6 }}>
            <Skeleton width={200} height={38} borderRadius={16} />
            <Skeleton width={140} height={38} borderRadius={16} />
          </View>
          <View style={{ alignSelf: "flex-end", gap: 6 }}>
            <Skeleton width={180} height={38} borderRadius={16} />
          </View>
          <View style={{ alignSelf: "flex-start" }}>
            <Skeleton width={220} height={52} borderRadius={16} />
          </View>
          <View style={{ alignSelf: "flex-end", gap: 6 }}>
            <Skeleton width={160} height={38} borderRadius={16} />
            <Skeleton width={100} height={38} borderRadius={16} />
          </View>
        </View>
        {/* Input skeleton */}
        <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 8, paddingTop: 8 }}>
          <Skeleton width="100%" height={44} borderRadius={22} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <RoomHeader
        roomId={roomId!}
        roomName={roomData.name}
        onlineCount={onlineCount}
        isCreator={roomData.creatorId === senderId}
        onSettingsPress={() => setShowSettings(true)}
        expiryBadge={<Badge label={formatted} variant={urgency === "critical" ? "critical" : urgency === "warning" ? "warning" : "default"} />}
      />

      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "flex-end" }}
          onViewableItemsChanged={handleViewableChange}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          keyboardDismissMode="interactive"
          renderItem={({ item }) => (
            <MessageBubble
              text={item.text}
              senderId={item.senderId}
              isOwn={item.senderId === senderId}
            />
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        <View style={{ paddingBottom: keyboardVisible ? 0 : insets.bottom }}>
          <MessageInput onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>

      {roomDbId && (
        <RoomSettingsSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          roomDbId={roomDbId}
          roomData={roomData}
          isCreator={roomData.creatorId === senderId}
        />
      )}
    </View>
  );
}
