const AVATAR_COLORS = ["#2B2926", "#4A4540", "#686460", "#97938C", "#7D7870", "#3D3934", "#5A5650", "#8B8680"];

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function getAvatarColor(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getBubbleStyles(colors: Record<string, string>) {
  return {
    own: {
      bg: colors.bubbleOwn,
      text: colors.bubbleOwnText,
      replyBg: "rgba(255,255,255,0.15)",
      replyBorder: "rgba(255,255,255,0.4)",
      replySender: "rgba(255,255,255,0.7)",
      replyText: "rgba(255,255,255,0.5)",
    },
    other: {
      bg: colors.bubbleOther,
      text: colors.bubbleOtherText,
      replyBg: colors.replyBg,
      replyBorder: colors.replyBorder,
      replySender: colors.textSecondary,
      replyText: colors.textMuted,
    },
  } as const;
}
