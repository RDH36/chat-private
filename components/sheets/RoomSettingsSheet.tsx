import { useState } from "react";
import { View, Text, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  deleteRoom,
  renameRoom,
  setRoomVisibility,
  setRoomPassword,
  type MessageExpiry,
} from "@/lib/room";
import { theme } from "@/lib/theme";
import { ModalSheet } from "@/components/ui/ModalSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EXPIRY_LABEL_KEYS: Record<string, string> = {
  on_room_expiry: "roomSettings.expiryOnRoom",
  after_read: "roomSettings.expiryAfterRead",
  never: "roomSettings.expiryNever",
};

interface RoomSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  roomDbId: string;
  roomData: {
    name: string | null;
    isPublic: boolean;
    creatorId: string;
    expiresAt: number | null;
    messageExpiry: MessageExpiry;
    passwordHash: string | null;
  };
  isCreator: boolean;
}

export function RoomSettingsSheet({
  visible,
  onClose,
  roomDbId,
  roomData,
  isCreator,
}: RoomSettingsSheetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(roomData.name ?? "");
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

  const handleDelete = () => {
    Alert.alert(
      t("roomSettings.deleteConfirmTitle"),
      t("roomSettings.deleteConfirmMessage"),
      [
        { text: t("roomSettings.cancel"), style: "cancel" },
        {
          text: t("roomSettings.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteRoom(roomDbId);
            onClose();
            router.replace("/expired?reason=deleted");
          },
        },
      ]
    );
  };

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
                thumbColor={theme.colors.bg}
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

        {/* Infos en lecture seule */}
        <InfoRow
          label={t("roomSettings.expiration")}
          value={roomData.expiresAt ? new Date(roomData.expiresAt).toLocaleString() : t("roomSettings.never")}
        />
        <InfoRow label={t("roomSettings.messageDeletion")} value={t(EXPIRY_LABEL_KEYS[roomData.messageExpiry])} />
      </View>

      {isCreator && (
        <Button variant="destructive" label={t("roomSettings.deleteRoom")} onPress={handleDelete} fullWidth />
      )}
    </ModalSheet>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
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
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.font.size.sm }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: theme.font.size.sm, fontWeight: theme.font.weight.medium }}>{value}</Text>
    </View>
  );
}
