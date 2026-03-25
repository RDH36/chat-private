import { useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/lib/identity";
import { useTheme } from "@/lib/theme";
import { DestroyAnimation } from "./DestroyAnimation";
import { ActionPopup, type ActionOption } from "@/components/ui/ActionPopup";
import { getInitials, getAvatarColor, formatTime, getBubbleStyles } from "./bubbleUtils";

interface MessageBubbleProps {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  senderName?: string;
  isOwn: boolean;
  createdAt?: number;
  replyToText?: string;
  replyToSender?: string;
  onImagePress?: (imageUrl: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: () => void;
}

export function MessageBubble({
  id: messageId, text, imageUrl, senderId, senderName: senderNameProp,
  isOwn, createdAt, replyToText, replyToSender, onImagePress, onDelete, onReply,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { nickname } = useProfile(isOwn ? undefined : senderId);
  const displayName = isOwn ? "" : (nickname || senderNameProp || "");
  const [destroying, setDestroying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const bubbleStyles = getBubbleStyles(theme.colors);
  const s = isOwn ? bubbleStyles.own : bubbleStyles.other;

  const actionOptions: ActionOption[] = [];
  if (onReply) actionOptions.push({ label: t("room.reply"), icon: "arrow-undo", onPress: onReply });
  if (isOwn && onDelete) actionOptions.push({
    label: t("room.deleteMessage"), icon: "trash-outline", destructive: true,
    onPress: () => setShowDeleteConfirm(true),
  });

  const deleteConfirmOptions: ActionOption[] = [
    { label: t("room.deleteMessage"), icon: "trash", destructive: true, onPress: () => setDestroying(true) },
    { label: t("room.cancel"), icon: "close", onPress: () => {} },
  ];

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => gs.dx > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => { if (gs.dx > 0) translateX.setValue(Math.min(gs.dx, 80)); },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 50 && onReply) onReply();
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
  }), [onReply, translateX]);

  const replyBlock = replyToText && replyToSender ? (
    <View style={{
      marginHorizontal: 8, marginTop: 8, backgroundColor: s.replyBg,
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
      borderLeftWidth: 3, borderLeftColor: s.replyBorder,
    }}>
      <Text style={{ fontSize: 11, fontWeight: theme.font.weight.semibold, color: s.replySender }}>{replyToSender}</Text>
      <Text numberOfLines={2} style={{ fontSize: 12, color: s.replyText }}>{replyToText}</Text>
    </View>
  ) : null;

  const bubbleContent = (
    <>
      {!isOwn && displayName ? (
        <Text style={{ color: getAvatarColor(senderId), fontSize: 12, fontWeight: theme.font.weight.semibold, marginBottom: 2, marginLeft: 12 }}>
          {displayName}
        </Text>
      ) : null}
      <View style={{ backgroundColor: s.bg, borderRadius: 20, overflow: "hidden", borderBottomRightRadius: isOwn ? 4 : 20, borderBottomLeftRadius: isOwn ? 20 : 4 }}>
        {replyBlock}
        {imageUrl ? (
          <Pressable onPress={() => onImagePress?.(imageUrl)} onLongPress={() => setShowPopup(true)} delayLongPress={400}>
            <Image source={{ uri: imageUrl }} style={{ width: 220, height: 220 }} resizeMode="cover" />
          </Pressable>
        ) : null}
        {text ? (
          <Text style={{ color: s.text, fontSize: 16, paddingHorizontal: 16, paddingVertical: 10 }}>{text}</Text>
        ) : null}
      </View>
      <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2, alignSelf: isOwn ? "flex-end" : "flex-start", marginHorizontal: 12 }}>
        {formatTime(createdAt)}
      </Text>
    </>
  );

  if (destroying) {
    return (
      <View style={{ marginBottom: 8, flexDirection: "row", justifyContent: isOwn ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
        {!isOwn && <View style={{ width: 28 }} />}
        <View style={{ maxWidth: "70%" }}>
          <DestroyAnimation onComplete={() => onDelete?.(messageId)} bubbleColor={s.bg} particleColor={theme.colors.particleDefault}>
            {bubbleContent}
          </DestroyAnimation>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 8, flexDirection: "row", justifyContent: isOwn ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
      {!isOwn && (
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: getAvatarColor(senderId), alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.colors.avatarText, fontSize: 13, fontWeight: theme.font.weight.bold }}>{getInitials(displayName || "?")}</Text>
        </View>
      )}

      <Animated.View style={{ maxWidth: "75%", transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <Pressable onLongPress={() => setShowPopup(true)} delayLongPress={400}>
          {bubbleContent}
        </Pressable>
      </Animated.View>

      <Animated.View style={{
        opacity: translateX.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: "clamp" }),
        position: "absolute", left: 8, bottom: 16,
      }}>
        <Ionicons name="arrow-undo" size={20} color={theme.colors.textMuted} />
      </Animated.View>

      <ActionPopup visible={showPopup} onClose={() => setShowPopup(false)} options={actionOptions} />
      <ActionPopup visible={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} options={deleteConfirmOptions} />
    </View>
  );
}
