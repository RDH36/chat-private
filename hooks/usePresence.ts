import { useMemo } from "react";
import { db } from "@/lib/instant";

interface PresenceData {
  senderId: string;
  senderName: string;
}

export function usePresence(roomId: string, user: PresenceData) {
  const room = db.room("chat", roomId);

  const presence = db.rooms.usePresence(room);

  // Publish our presence
  db.rooms.useSyncPresence(room, user);

  const peers = useMemo(() => {
    if (!presence.peers) return [];
    return Object.values(presence.peers);
  }, [presence.peers]);

  const onlineCount = peers.length + 1; // +1 for self

  return { peers, onlineCount, isLoading: !presence.peers };
}
