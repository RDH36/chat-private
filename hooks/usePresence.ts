import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/instant";

const TYPING_TIMEOUT = 3000;

interface PresenceData {
  senderId: string;
  senderName: string;
}

export function usePresence(roomId: string, user: PresenceData) {
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const room = db.room("chat", roomId);

  const presence = db.rooms.usePresence(room);

  db.rooms.useSyncPresence(room, { ...user, isTyping }, [
    user.senderId,
    user.senderName,
    isTyping,
  ]);

  const peers = useMemo(() => {
    if (!presence.peers) return [];
    return Object.values(presence.peers);
  }, [presence.peers]);

  const typingPeers = useMemo(
    () => peers.filter((p) => p.isTyping),
    [peers]
  );

  const onlineCount = peers.length + 1;

  const stopTyping = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsTyping(false);
  }, []);

  const onTyping = useCallback(() => {
    setIsTyping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      timerRef.current = null;
    }, TYPING_TIMEOUT);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { peers, typingPeers, onlineCount, onTyping, stopTyping, isLoading: !presence.peers };
}
