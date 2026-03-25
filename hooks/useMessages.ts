import { useMemo } from "react";
import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";

interface ReplyData {
  replyToId: string;
  replyToText: string;
  replyToSender: string;
}

export function useMessages(roomDbId: string | undefined) {
  const query = db.useQuery(
    roomDbId
      ? {
          messages: {
            $: {
              where: { room: roomDbId },
              order: { createdAt: "asc" as const },
            },
          },
        }
      : null
  );

  const messages = useMemo(() => {
    if (!query.data?.messages) return [];
    return query.data.messages;
  }, [query.data?.messages]);

  const sendMessage = async (
    text: string,
    senderId: string,
    senderName: string,
    image?: { url: string; path: string },
    reply?: ReplyData
  ) => {
    if (!roomDbId || (!text.trim() && !image)) return;

    const msgId = id();
    await db.transact([
      tx.messages[msgId].update({
        ...(text.trim() || !image ? { text: text.trim() } : {}),
        senderId,
        senderName,
        createdAt: Date.now(),
        readBy: JSON.stringify([senderId]),
        ...(image ? { imageUrl: image.url, imagePath: image.path } : {}),
        ...(reply ? reply : {}),
      }),
      tx.messages[msgId].link({ room: roomDbId }),
    ]);
  };

  const deleteMessage = async (messageId: string, imagePath?: string | null) => {
    if (imagePath) {
      db.storage.delete(imagePath).catch(() => {});
    }
    await db.transact(tx.messages[messageId].delete());
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    isLoading: query.isLoading,
    error: query.error,
  };
}
