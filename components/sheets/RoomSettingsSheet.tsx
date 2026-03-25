import { useState } from "react";
import { View, Text, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  deleteRoom,
  leaveRoom,
  banUser,
  renameRoom,
  setRoomVisibility,
  setRoomPassword,
  setRoomExpiry,
  setRoomMessageExpiry,
  setRoomAllowCodeSharing,
  setRoomAllowScreenshot,
  parseMembers,
  EXPIRY_OPTIONS,
  MESSAGE_EXPIRY_OPTIONS,
  type MessageExpiry,
} from "@/lib/room";
import { useTheme } from "@/lib/theme";
import { ModalSheet } from "@/components/ui/ModalSheet";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ActionPopup } from "@/components/ui/ActionPopup";

const EXPIRY_LABEL_KEYS: Record<string, string> = {
  on_room_expiry: "roomSettings.expiryOnRoom",
  after_read: "roomSettings.expiryAfterRead",
  never: "roomSettings.expiryNever",
};

interface RoomSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  roomDbId: string;
  userId: string;
  roomData: {
    name: string | null;
    isPublic: boolean;
    creatorId: string;
    expiresAt: number | null;
    messageExpiry: MessageExpiry;
    passwordHash: string | null;
    allowCodeSharing?: boolean;
    allowScreenshot?: boolean;
    members?: unknown;
    bannedMembers?: unknown;
  };
  isCreator: boolean;
  memberNames: Record<string, string>;
}

export function RoomSettingsSheet({
  visible,
  onClose,
  roomDbId,
  userId,
  roomData,
  isCreator,
  memberNames,
}: RoomSettingsSheetProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(roomData.name ?? "");
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [banTarget, setBanTarget] = useState<string | null>(null);

  const handleRename = async () => {
    if (!newName.trim()) return;
    await renameRoom(roomDbId, newName);
    setEditingName(false);
  };

  const handleTogglePublic = async (value: boolean) => {
    await setRoomVisibility(roomDbId, value);
  };

  const handleSetPassword = async () => {
    await setRoomPassword(roomDbId, newPassword || null);
    setEditingPassword(false);
    setNewPassword("");
  };

  const handleRemovePassword = async () => {
    await setRoomPassword(roomDbId, null);
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    await deleteRoom(roomDbId);
    onClose();
    router.replace("/expired?reason=deleted");
  };

  const confirmLeave = async () => {
    await leaveRoom(roomDbId, userId, roomData.members);
    onClose();
    router.replace("/");
  };

  const confirmBan = async () => {
    if (!banTarget) return;
    await banUser(roomDbId, banTarget, roomData.members, roomData.bannedMembers);
    setBanTarget(null);
  };

  const members = parseMembers(roomData.members).filter((id) => id !== roomData.creatorId);

  return (
    <ModalSheet visible={visible} onClose={onClose} title={t("roomSettings.title")}>
      <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
        {/* Renommer */}
        {isCreator && (
          <Section label={t("roomSettings.roomName")}>
            {editingName ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input value={newName} onChangeText={setNewName} placeholder={t("roomSettings.newName")} autoFocus />
                </View>
                <Button label="OK" fullWidth={false} onPress={handleRename} />
              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm, fontWeight: theme.font.weight.medium }}>
                  {roomData.name || t("roomSettings.noName")}
                </Text>
                <Button label={t("roomSettings.rename")} variant="secondary" fullWidth={false} onPress={() => { setNewName(roomData.name ?? ""); setEditingName(true); }} />
              </View>
            )}
          </Section>
        )}

        {/* Visibilite */}
        {isCreator && (
          <Section label={t("roomSettings.visibility")}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm }}>
                {t("roomSettings.publicRoom")}
              </Text>
              <Switch
                value={roomData.isPublic}
                onValueChange={handleTogglePublic}
                trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
                thumbColor={theme.colors.switchThumb}
              />
            </View>
          </Section>
        )}

        {/* Mot de passe */}
        {isCreator && (
          <Section label={t("roomSettings.password")}>
            {editingPassword ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t("roomSettings.newPassword")}
                    secureTextEntry
                    autoFocus
                  />
                </View>
                <Button label="OK" fullWidth={false} onPress={handleSetPassword} />
              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm }}>
                  {roomData.passwordHash ? t("roomSettings.passwordActive") : t("roomSettings.passwordNone")}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {roomData.passwordHash && (
                    <Button label={t("roomSettings.remove")} variant="destructive" fullWidth={false} onPress={handleRemovePassword} />
                  )}
                  <Button
                    label={roomData.passwordHash ? t("roomSettings.change") : t("roomSettings.add")}
                    variant="secondary"
                    fullWidth={false}
                    onPress={() => { setNewPassword(""); setEditingPassword(true); }}
                  />
                </View>
              </View>
            )}
          </Section>
        )}

        {/* Expiration */}
        {isCreator ? (
          <Section label={t("roomSettings.expiration")}>
            <RadioGroup
              options={EXPIRY_OPTIONS.map((opt, i) => ({
                label: t(opt.labelKey),
                value: i.toString(),
              }))}
              selected={getCurrentExpiryIndex(roomData.expiresAt).toString()}
              onSelect={(value) => {
                const ms = EXPIRY_OPTIONS[parseInt(value, 10)].ms;
                setRoomExpiry(roomDbId, ms);
              }}
            />
          </Section>
        ) : (
          <InfoRow
            label={t("roomSettings.expiration")}
            value={roomData.expiresAt ? new Date(roomData.expiresAt).toLocaleString() : t("roomSettings.never")}
          />
        )}

        {/* Message deletion */}
        {isCreator ? (
          <Section label={t("roomSettings.messageDeletion")}>
            <RadioGroup
              options={MESSAGE_EXPIRY_OPTIONS.map((opt) => ({
                label: t(opt.labelKey),
                value: opt.value,
              }))}
              selected={roomData.messageExpiry}
              onSelect={(value) => setRoomMessageExpiry(roomDbId, value as MessageExpiry)}
            />
          </Section>
        ) : (
          <InfoRow label={t("roomSettings.messageDeletion")} value={t(EXPIRY_LABEL_KEYS[roomData.messageExpiry])} />
        )}

        {isCreator && (
          <Section label={t("roomSettings.allowCodeSharing")}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm }}>
                {t("roomSettings.allowCodeSharing")}
              </Text>
              <Switch
                value={roomData.allowCodeSharing !== false}
                onValueChange={(value) => setRoomAllowCodeSharing(roomDbId, value)}
                trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
                thumbColor={theme.colors.switchThumb}
              />
            </View>
          </Section>
        )}

        {isCreator && (
          <Section label={t("roomSettings.allowScreenshot")}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm }}>
                {t("roomSettings.allowScreenshot")}
              </Text>
              <Switch
                value={roomData.allowScreenshot === true}
                onValueChange={(value) => setRoomAllowScreenshot(roomDbId, value)}
                trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
                thumbColor={theme.colors.switchThumb}
              />
            </View>
          </Section>
        )}

        {/* Members list (creator only) */}
        {isCreator && members.length > 0 && (
          <Section label={t("roomSettings.members")}>
            <View style={{ gap: 8 }}>
              {members.map((memberId) => (
                <View key={memberId} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm }}>
                    {memberNames[memberId] || memberId.slice(0, 8)}
                  </Text>
                  <Button label={t("roomSettings.ban")} variant="destructive" fullWidth={false} onPress={() => setBanTarget(memberId)} />
                </View>
              ))}
            </View>
          </Section>
        )}
      </View>

      {/* Leave room (non-creator) */}
      {!isCreator && (
        <Button variant="destructive" label={t("roomSettings.leaveRoom")} onPress={() => setShowLeaveConfirm(true)} fullWidth />
      )}

      {isCreator && (
        <Button variant="destructive" label={t("roomSettings.deleteRoom")} onPress={handleDelete} fullWidth />
      )}

      <ActionPopup
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("roomSettings.deleteConfirmTitle")}
        message={t("roomSettings.deleteConfirmMessage")}
        options={[
          { label: t("roomSettings.cancel"), icon: "close-outline", onPress: () => {} },
          { label: t("roomSettings.delete"), icon: "trash-outline", destructive: true, onPress: confirmDelete },
        ]}
      />

      <ActionPopup
        visible={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title={t("roomSettings.leaveConfirmTitle")}
        message={t("roomSettings.leaveConfirmMessage")}
        options={[
          { label: t("roomSettings.cancel"), icon: "close-outline", onPress: () => {} },
          { label: t("roomSettings.leave"), icon: "exit-outline", destructive: true, onPress: confirmLeave },
        ]}
      />

      <ActionPopup
        visible={!!banTarget}
        onClose={() => setBanTarget(null)}
        title={t("roomSettings.banConfirmTitle")}
        message={t("roomSettings.banConfirmMessage")}
        options={[
          { label: t("roomSettings.cancel"), icon: "close-outline", onPress: () => {} },
          { label: t("roomSettings.ban"), icon: "ban-outline", destructive: true, onPress: confirmBan },
        ]}
      />
    </ModalSheet>
  );
}

function getCurrentExpiryIndex(expiresAt: number | null): number {
  if (!expiresAt) return EXPIRY_OPTIONS.length - 1; // "Never"
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return EXPIRY_OPTIONS.length - 1;
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < EXPIRY_OPTIONS.length; i++) {
    const ms = EXPIRY_OPTIONS[i].ms;
    if (ms === null) continue;
    const diff = Math.abs(remaining - ms);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  }
  return closest;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.font.size.xs, fontWeight: theme.font.weight.semibold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.font.size.sm }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm, fontWeight: theme.font.weight.medium }}>{value}</Text>
    </View>
  );
}
