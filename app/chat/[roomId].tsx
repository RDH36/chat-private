import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { View, FlatList, Text, TextInput, Pressable, Keyboard, Platform, NativeModules } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { isRoomActive, verifyRoomPassword, deleteRoom, joinRoom, isBanned, type MessageExpiry } from "@/lib/room";
import { useCurrentUser, useProfile } from "@/lib/identity";
import { useMessages } from "@/hooks/useMessages";
import { usePresence } from "@/hooks/usePresence";
import { useExpiry } from "@/hooks/useExpiry";
import { useReadReceipts } from "@/hooks/useReadReceipts";
import { useImagePicker } from "@/hooks/useImagePicker";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput, type ReplyTo } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { RoomHeader } from "@/components/chat/RoomHeader";
import { Badge } from "@/components/ui/Badge";
import { RoomSettingsSheet } from "@/components/sheets/RoomSettingsSheet";
import { ImageViewer } from "@/components/chat/ImageViewer";
import { ActionPopup } from "@/components/ui/ActionPopup";
import { useTheme } from "@/lib/theme";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatScreen() {
  const { t } = useTranslation();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

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
    allowCodeSharing?: boolean;
    allowScreenshot?: boolean;
    members?: unknown;
    bannedMembers?: unknown;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

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

    // Check if user is banned
    if (senderId && isBanned((room as any).bannedMembers, senderId)) {
      router.replace("/expired?reason=banned");
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
        allowCodeSharing: (room as any).allowCodeSharing,
        allowScreenshot: (room as any).allowScreenshot,
        members: room.members,
        bannedMembers: (room as any).bannedMembers,
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
      allowCodeSharing: (room as any).allowCodeSharing,
      allowScreenshot: (room as any).allowScreenshot,
      members: room.members,
      bannedMembers: (room as any).bannedMembers,
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

  const { messages, sendMessage, deleteMessage, isLoading } = useMessages(roomDbId);
  const { onlineCount, typingPeers, onTyping, stopTyping } = usePresence(roomId!, { senderId, senderName });
  const { formatted, urgency, isExpired } = useExpiry(roomData?.expiresAt);
  const { pickFromCamera, uploadFromUri, permissionError, clearPermissionError } = useImagePicker();
  const { markAsRead } = useReadReceipts(
    roomData?.messageExpiry ?? "never",
    onlineCount
  );

  useEffect(() => {
    if (isExpired) router.replace("/expired?reason=expired");
  }, [isExpired, router]);

  useEffect(() => {
    if (!roomData) return;
    const mod = Platform.OS !== "web" ? NativeModules.RNScreenshotPrevent : null;
    if (!mod) return;
    if (roomData.allowScreenshot === true) {
      mod.disableSecureView?.();
    } else {
      mod.enableSecureView?.("");
    }
    return () => {
      mod.disableSecureView?.();
    };
  }, [roomData?.allowScreenshot]);

  const handleSend = useCallback(
    async (text: string, image?: { url: string; path: string }) => {
      stopTyping();
      const reply = replyTo
        ? { replyToId: replyTo.id, replyToText: replyTo.text ?? "", replyToSender: replyTo.senderName }
        : undefined;
      setReplyTo(null);
      await sendMessage(text, senderId, senderName, image, reply);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [sendMessage, senderId, senderName, stopTyping, replyTo]
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      deleteMessage(messageId, msg?.imagePath);
    },
    [messages, deleteMessage]
  );

  const handleReply = useCallback(
    (msg: { id: string; text?: string; senderName: string }) => {
      setReplyTo({ id: msg.id, text: msg.text, senderName: msg.senderName });
    },
    []
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

  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of messages) {
      if (!map[m.senderId]) map[m.senderId] = m.senderName;
    }
    return map;
  }, [messages]);

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
        allowCodeSharing={roomData.allowCodeSharing !== false}
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
              id={item.id}
              text={item.text}
              imageUrl={item.imageUrl}
              senderId={item.senderId}
              senderName={item.senderName}
              isOwn={item.senderId === senderId}
              createdAt={item.createdAt}
              replyToText={item.replyToText}
              replyToSender={item.replyToSender}
              onImagePress={setViewingImage}
              onDelete={handleDelete}
              onReply={() => handleReply({ id: item.id, text: item.text, senderName: item.senderName })}
            />
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        <TypingIndicator typingUsers={typingPeers} />
        <View style={{ paddingBottom: keyboardVisible ? 0 : insets.bottom }}>
          <MessageInput
            onSend={handleSend}
            onTyping={onTyping}
            onPickFromUri={uploadFromUri}
            onPickFromCamera={pickFromCamera}
            onRemoveImage={(path) => (db as any)._core._reactor.deleteFile(path).catch(() => {})}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </View>
      </KeyboardAvoidingView>

      <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />

      {roomDbId && (
        <RoomSettingsSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          roomDbId={roomDbId}
          userId={senderId}
          roomData={roomData}
          isCreator={roomData.creatorId === senderId}
          memberNames={memberNames}
        />
      )}

      <ActionPopup
        visible={!!permissionError}
        onClose={clearPermissionError}
        title={permissionError?.title}
        message={permissionError?.message}
        options={[
          { label: "OK", icon: "checkmark-outline", onPress: () => {} },
        ]}
      />
    </View>
  );
}
