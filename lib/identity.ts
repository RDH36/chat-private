import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";

// --- Auth InstantDB (guest + email) ---

export function useCurrentUser() {
  const { isLoading, user, error } = db.useAuth();
  return { user, isLoading, error };
}

export async function ensureSignedIn() {
  const user = await db.getAuth();
  if (!user) {
    await db.auth.signInAsGuest();
  }
}

// --- Profile (InstantDB) ---

export function useProfile(userId: string | undefined) {
  const query = db.useQuery(
    userId
      ? { profiles: { $: { where: { userId } } } }
      : null
  );
  const profile = query.data?.profiles?.[0] ?? null;
  return {
    nickname: profile?.nickname ?? (userId ? getDefaultName(userId) : ""),
    profileId: profile?.id ?? null,
    isLoading: query.isLoading,
  };
}

export function getDefaultName(userId: string): string {
  return `User#${userId.substring(0, 4)}`;
}

export async function isNicknameAvailable(
  nickname: string,
  currentUserId: string
): Promise<boolean> {
  const { data } = await db.queryOnce({
    profiles: { $: { where: { nickname: nickname.trim() } } },
  });
  const existing = data.profiles[0];
  if (!existing) return true;
  return existing.userId === currentUserId;
}

export async function saveNickname(
  userId: string,
  nickname: string,
  profileId: string | null
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = nickname.trim();
  if (!trimmed) return { ok: false, error: "Le pseudo ne peut pas etre vide" };
  if (trimmed.length < 2) return { ok: false, error: "2 caracteres minimum" };

  const available = await isNicknameAvailable(trimmed, userId);
  if (!available) return { ok: false, error: "Ce pseudo est deja pris" };

  if (profileId) {
    await db.transact(tx.profiles[profileId].update({ nickname: trimmed }));
  } else {
    const newId = id();
    await db.transact(tx.profiles[newId].update({ userId, nickname: trimmed }));
  }
  return { ok: true };
}

// Keep for backward compat in messages
export async function getNickname(userId: string): Promise<string> {
  const { data } = await db.queryOnce({
    profiles: { $: { where: { userId } } },
  });
  return data.profiles[0]?.nickname ?? getDefaultName(userId);
}
