import { useState, useEffect, useMemo } from "react";

export function useExpiry(expiresAt: number | null | undefined) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const remaining = useMemo(() => {
    if (!expiresAt) return null;
    return Math.max(0, expiresAt - now);
  }, [expiresAt, now]);

  const isExpired = remaining !== null && remaining <= 0;

  const formatted = useMemo(() => {
    if (remaining === null) return "Pas d'expiration";
    if (remaining <= 0) return "Expiré";

    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1_000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }, [remaining]);

  const urgency: "normal" | "warning" | "critical" = useMemo(() => {
    if (remaining === null) return "normal";
    if (remaining < 60_000) return "critical";
    if (remaining < 300_000) return "warning";
    return "normal";
  }, [remaining]);

  return { remaining, isExpired, formatted, urgency };
}
