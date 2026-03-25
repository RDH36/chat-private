import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";
import { sha256 } from "js-sha256";

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export type MessageExpiry = "on_room_expiry" | "after_read" | "never";

export interface RoomConfig {
  name?: string;
  isPublic: boolean;
  expiresInMs: number | null; // null = never
  messageExpiry: MessageExpiry;
  password?: string;
  allowCodeSharing?: boolean; // default true
  allowScreenshot?: boolean; // default false (blocked)
}

const EXPIRY_OPTIONS = [
  { labelKey: "room.expiry1h", ms: 3_600_000 },
  { labelKey: "room.expiry6h", ms: 21_600_000 },
  { labelKey: "room.expiry24h", ms: 86_400_000 },
  { labelKey: "room.expiry7d", ms: 604_800_000 },
  { labelKey: "room.expiryNever", ms: null },
] as const;

const MESSAGE_EXPIRY_OPTIONS: { labelKey: string; value: MessageExpiry }[] = [
  { labelKey: "room.msgExpiryOnRoom", value: "on_room_expiry" },
  { labelKey: "room.msgExpiryAfterRead", value: "after_read" },
  { labelKey: "room.msgExpiryNever", value: "never" },
];

export { EXPIRY_OPTIONS, MESSAGE_EXPIRY_OPTIONS };

export async function createRoom(
  creatorId: string,
  config: RoomConfig
): Promise<string> {
  const roomId = generateRoomId();
  const now = Date.now();
  const roomDbId = id();

  await db.transact(
    tx.rooms[roomDbId].update({
      roomId,
      name: config.name || undefined,
      isPublic: config.isPublic,
      createdAt: now,
      creatorId,
      expiresAt: config.expiresInMs ? now + config.expiresInMs : undefined,
      messageExpiry: config.messageExpiry,
      passwordHash: config.password ? sha256(config.password) : undefined,
      allowCodeSharing: config.allowCodeSharing ?? true,
      allowScreenshot: config.allowScreenshot ?? false,
      members: JSON.stringify([creatorId]),
    })
  );

  return roomId;
}

export function isRoomActive(room: {
  deletedAt?: number | null;
  expiresAt?: number | null;
}): boolean {
  if (room.deletedAt) return false;
  if (room.expiresAt && room.expiresAt < Date.now()) return false;
  return true;
}

export async function deleteRoom(roomDbId: string): Promise<void> {
  await deleteRoomImages(roomDbId);
  await db.transact(tx.rooms[roomDbId].delete());
}

async function deleteRoomImages(roomDbId: string): Promise<void> {
  try {
    const { data } = await db.queryOnce({
      messages: { $: { where: { room: roomDbId } } },
    });
    const paths = (data?.messages ?? [])
      .map((m: { imagePath?: string | null }) => m.imagePath)
      .filter(Boolean) as string[];
    await Promise.all(paths.map((p) => db.storage.delete(p).catch(() => {})));
  } catch {
    // Best-effort cleanup
  }
}

export async function cleanupExpiredRooms(
  rooms: Array<{ id: string; expiresAt?: number | null; deletedAt?: number | null }>
): Promise<void> {
  const now = Date.now();
  const toDelete = rooms.filter(
    (r) => r.deletedAt || (r.expiresAt && r.expiresAt < now)
  );
  if (toDelete.length === 0) return;
  await Promise.all(toDelete.map((r) => deleteRoomImages(r.id)));
  await db.transact(toDelete.map((r) => tx.rooms[r.id].delete()));
}

export function verifyRoomPassword(
  inputPassword: string,
  storedHash: string
): boolean {
  return sha256(inputPassword) === storedHash;
}

export function parseMembers(members: unknown): string[] {
  if (!members) return [];
  if (typeof members === "string") {
    try { return JSON.parse(members); } catch { return []; }
  }
  if (Array.isArray(members)) return members;
  return [];
}

export function parseReadBy(readBy: unknown): string[] {
  if (!readBy) return [];
  if (typeof readBy === "string") {
    try { return JSON.parse(readBy); } catch { return []; }
  }
  if (Array.isArray(readBy)) return readBy;
  return [];
}

export function isRoomMember(members: unknown, userId: string): boolean {
  return parseMembers(members).includes(userId);
}

export async function joinRoom(
  roomDbId: string,
  userId: string,
  currentMembers: unknown
): Promise<void> {
  const members = parseMembers(currentMembers);
  if (members.includes(userId)) return;
  members.push(userId);
  await db.transact(tx.rooms[roomDbId].update({ members: JSON.stringify(members) }));
}

export function parseBannedMembers(banned: unknown): string[] {
  if (!banned) return [];
  if (typeof banned === "string") {
    try { return JSON.parse(banned); } catch { return []; }
  }
  if (Array.isArray(banned)) return banned;
  return [];
}

export function isBanned(bannedMembers: unknown, userId: string): boolean {
  return parseBannedMembers(bannedMembers).includes(userId);
}

export async function leaveRoom(
  roomDbId: string,
  userId: string,
  currentMembers: unknown
): Promise<void> {
  const members = parseMembers(currentMembers).filter((id) => id !== userId);
  await db.transact(tx.rooms[roomDbId].update({ members: JSON.stringify(members) }));
}

export async function banUser(
  roomDbId: string,
  userId: string,
  currentMembers: unknown,
  currentBanned: unknown
): Promise<void> {
  const members = parseMembers(currentMembers).filter((id) => id !== userId);
  const banned = parseBannedMembers(currentBanned);
  if (!banned.includes(userId)) banned.push(userId);
  await db.transact(tx.rooms[roomDbId].update({
    members: JSON.stringify(members),
    bannedMembers: JSON.stringify(banned),
  }));
}

export async function renameRoom(
  roomDbId: string,
  newName: string
): Promise<void> {
  await db.transact(tx.rooms[roomDbId].update({ name: newName.trim() }));
}

export async function setRoomVisibility(
  roomDbId: string,
  isPublic: boolean
): Promise<void> {
  await db.transact(tx.rooms[roomDbId].update({ isPublic }));
}

export async function setRoomExpiry(
  roomDbId: string,
  expiresInMs: number | null
): Promise<void> {
  await db.transact(
    tx.rooms[roomDbId].update({
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
    })
  );
}

export async function setRoomMessageExpiry(
  roomDbId: string,
  messageExpiry: MessageExpiry
): Promise<void> {
  await db.transact(tx.rooms[roomDbId].update({ messageExpiry }));
}

export async function setRoomPassword(
  roomDbId: string,
  password: string | null
): Promise<void> {
  await db.transact(
    tx.rooms[roomDbId].update({
      passwordHash: password ? sha256(password) : "",
    })
  );
}

export async function setRoomAllowCodeSharing(
  roomDbId: string,
  allowCodeSharing: boolean
): Promise<void> {
  await db.transact(tx.rooms[roomDbId].update({ allowCodeSharing }));
}

export async function setRoomAllowScreenshot(
  roomDbId: string,
  allowScreenshot: boolean
): Promise<void> {
  await db.transact(tx.rooms[roomDbId].update({ allowScreenshot }));
}
