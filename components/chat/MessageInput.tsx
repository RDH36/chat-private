import { useState } from "react";
import { View, Text, TextInput, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";
import { GalleryPicker } from "./GalleryPicker";

export interface ImageData {
  url: string;
  path: string;
}

export interface ReplyTo {
  id: string;
  text?: string;
  senderName: string;
}

interface MessageInputProps {
  onSend: (text: string, image?: ImageData) => void;
  onTyping?: () => void;
  onPickFromUri: (uri: string) => Promise<ImageData | null>;
  onPickFromCamera: () => Promise<ImageData | null>;
  onRemoveImage?: (path: string) => void;
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;
}

export function MessageInput({ onSend, onTyping, onPickFromUri, onPickFromCamera, onRemoveImage, replyTo, onCancelReply }: MessageInputProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [image, setImage] = useState<ImageData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleChangeText = (value: string) => {
    setText(value);
    if (value.trim()) onTyping?.();
  };

  const handleSend = () => {
    if (!text.trim() && !image) return;
    onSend(text, image ?? undefined);
    setText("");
    setImage(null);
  };

  const handleSelectFromGallery = async (uri: string) => {
    setUploading(true);
    const result = await onPickFromUri(uri);
    setUploading(false);
    if (result) setImage(result);
  };

  const handleCamera = async () => {
    setUploading(true);
    const result = await onPickFromCamera();
    setUploading(false);
    if (result) setImage(result);
  };

  return (
    <View style={{ backgroundColor: theme.colors.bg, borderTopColor: theme.colors.border, borderTopWidth: 1 }}>
      {replyTo && (
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4,
        }}>
          <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: theme.colors.replyBorder, paddingLeft: 10, marginRight: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: theme.font.weight.semibold, color: theme.colors.textSecondary }}>
              {t("room.replyingTo", { name: replyTo.senderName })}
            </Text>
            {replyTo.text ? (
              <Text numberOfLines={1} style={{ fontSize: 13, color: theme.colors.textMuted }}>{replyTo.text}</Text>
            ) : null}
          </View>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        {uploading && (
          <View style={{ marginBottom: 8, alignSelf: "flex-start", width: 80, height: 80, borderRadius: 12, backgroundColor: theme.colors.inputBg, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          </View>
        )}
        {image && !uploading && (
          <View style={{ marginBottom: 8, alignSelf: "flex-start" }}>
            <Image source={{ uri: image.url }} style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="cover" />
            <Pressable
              onPress={() => { onRemoveImage?.(image.path); setImage(null); }}
              style={{
                position: "absolute", top: -6, right: -6,
                backgroundColor: theme.colors.error, borderRadius: 10,
                width: 20, height: 20, alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={14} color={theme.colors.accentText} />
            </Pressable>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <Pressable
            onPress={() => setShowGallery(true)}
            disabled={uploading}
            style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", opacity: uploading ? 0.3 : 0.6 }}
          >
            <Ionicons name="image-outline" size={24} color={theme.colors.text} />
          </Pressable>
          <TextInput
            placeholder={t("room.messagePlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={handleChangeText}
            multiline
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            style={{
              flex: 1, backgroundColor: theme.colors.inputBg, color: theme.colors.text,
              borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, maxHeight: 100,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() && !image}
            style={{
              backgroundColor: theme.colors.accent, opacity: text.trim() || image ? 1 : 0.3,
              borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-up" size={20} color={theme.colors.accentText} />
          </Pressable>
        </View>
      </View>

      <GalleryPicker
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectFromGallery}
        onCamera={handleCamera}
      />
    </View>
  );
}
