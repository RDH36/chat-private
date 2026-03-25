import { useCallback } from "react";
import { db } from "@/lib/instant";
import { tx } from "@instantdb/react-native";
import { parseReadBy, type MessageExpiry } from "@/lib/room";

interface Message {
  id: string;
  readBy?: string | null;
  senderId: string;
  imagePath?: string | null;
}

export function useReadReceipts(
  messageExpiry: MessageExpiry,
  onlineCount: number
) {
  const markAsRead = useCallback(
    async (message: Message, currentSenderId: string) => {
      const readBy = parseReadBy(message.readBy);

      if (readBy.includes(currentSenderId)) return;

      const updatedReadBy = [...readBy, currentSenderId];

      if (
        messageExpiry === "after_read" &&
        updatedReadBy.length >= onlineCount
      ) {
        if (message.imagePath) {
          db.storage.delete(message.imagePath).catch(() => {});
        }
        await db.transact(tx.messages[message.id].delete());
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
