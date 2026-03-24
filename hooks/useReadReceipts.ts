import { useCallback } from "react";
import { db } from "@/lib/instant";
import { tx } from "@instantdb/react-native";
import type { MessageExpiry } from "@/lib/room";

interface Message {
  id: string;
  readBy?: string | null;
  senderId: string;
}

export function useReadReceipts(
  messageExpiry: MessageExpiry,
  onlineCount: number
) {
  const markAsRead = useCallback(
    async (message: Message, currentSenderId: string) => {
      const readBy: string[] = message.readBy
        ? JSON.parse(message.readBy as string)
        : [];

      if (readBy.includes(currentSenderId)) return;

      const updatedReadBy = [...readBy, currentSenderId];

      // If "after_read" and all online users have read, soft-delete
      if (
        messageExpiry === "after_read" &&
        updatedReadBy.length >= onlineCount
      ) {
        await db.transact(
          tx.messages[message.id].update({
            readBy: JSON.stringify(updatedReadBy),
            deletedAt: Date.now(),
          })
        );
      } else {
        await db.transact(
          tx.messages[message.id].update({
            readBy: JSON.stringify(updatedReadBy),
          })
        );
      }
    },
    [messageExpiry, onlineCount]
  );

  return { markAsRead };
}
