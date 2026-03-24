import { useMemo } from "react";
import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";

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
    return query.data.messages.filter((m) => !m.deletedAt);
  }, [query.data?.messages]);

  const sendMessage = async (
    text: string,
    senderId: string,
    senderName: string
  ) => {
    if (!roomDbId || !text.trim()) return;

    const msgId = id();
    await db.transact([
      tx.messages[msgId].update({
        text: text.trim(),
        senderId,
        senderName,
        createdAt: Date.now(),
        readBy: JSON.stringify([senderId]),
      }),
      tx.messages[msgId].link({ room: roomDbId }),
    ]);
  };

  return {
    messages,
    sendMessage,
    isLoading: query.isLoading,
    error: query.error,
  };
}
