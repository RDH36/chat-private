import { useState } from "react";
import { View, Text, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import {
  EXPIRY_OPTIONS,
  MESSAGE_EXPIRY_OPTIONS,
  type MessageExpiry,
  type RoomConfig,
} from "@/lib/room";
import { useTheme } from "@/lib/theme";
import { ModalSheet } from "@/components/ui/ModalSheet";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface RoomConfigSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (config: RoomConfig) => void;
}

export function RoomConfigSheet({
  visible,
  onClose,
  onCreateRoom,
}: RoomConfigSheetProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [expiryIdx, setExpiryIdx] = useState(2);
  const [messageExpiry, setMessageExpiry] = useState<MessageExpiry>("after_read");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [allowCodeSharing, setAllowCodeSharing] = useState(true);
  const [allowScreenshot, setAllowScreenshot] = useState(false);

  const handleCreate = () => {
    onCreateRoom({
      name: name.trim() || undefined,
      isPublic,
      expiresInMs: EXPIRY_OPTIONS[expiryIdx].ms,
      messageExpiry,
      password: hasPassword && password ? password : undefined,
      allowCodeSharing,
      allowScreenshot,
    });
    onClose();
  };

  const expiryOptions = EXPIRY_OPTIONS.map((opt, i) => ({
    label: t(opt.labelKey),
    value: i.toString(),
  }));

  const messageExpiryOptions = MESSAGE_EXPIRY_OPTIONS.map((opt) => ({
    label: t(opt.labelKey),
    value: opt.value,
  }));

  return (
    <ModalSheet visible={visible} onClose={onClose} title={t("roomConfig.title")}>
      <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <View>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.font.size.xs,
              fontWeight: theme.font.weight.semibold,
              marginBottom: theme.spacing.sm,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("roomConfig.nameOptional")}
          </Text>
          <Input
            placeholder={t("roomConfig.namePlaceholder")}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm }}>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.font.size.xs,
                fontWeight: theme.font.weight.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("roomConfig.publicRoom")}
            </Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
              thumbColor={theme.colors.switchThumb}
            />
          </View>
        </View>

        <View>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.font.size.xs,
              fontWeight: theme.font.weight.semibold,
              marginBottom: theme.spacing.sm,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("roomConfig.expiryDuration")}
          </Text>
          <RadioGroup
            options={expiryOptions}
            selected={expiryIdx.toString()}
            onSelect={(value) => setExpiryIdx(parseInt(value, 10))}
          />
        </View>

        <View>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.font.size.xs,
              fontWeight: theme.font.weight.semibold,
              marginBottom: theme.spacing.sm,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("roomConfig.messageDeletion")}
          </Text>
          <RadioGroup
            options={messageExpiryOptions}
            selected={messageExpiry}
            onSelect={(value) => setMessageExpiry(value as MessageExpiry)}
          />
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm }}>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.font.size.xs,
                fontWeight: theme.font.weight.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("roomConfig.passwordOptional")}
            </Text>
            <Switch
              value={hasPassword}
              onValueChange={setHasPassword}
              trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
              thumbColor={theme.colors.switchThumb}
            />
          </View>
          {hasPassword && (
            <Input
              placeholder={t("roomConfig.passwordPlaceholder")}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm }}>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.font.size.xs,
                fontWeight: theme.font.weight.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("roomConfig.allowCodeSharing")}
            </Text>
            <Switch
              value={allowCodeSharing}
              onValueChange={setAllowCodeSharing}
              trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
              thumbColor={theme.colors.switchThumb}
            />
          </View>
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm }}>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.font.size.xs,
                fontWeight: theme.font.weight.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t("roomConfig.allowScreenshot")}
            </Text>
            <Switch
              value={allowScreenshot}
              onValueChange={setAllowScreenshot}
              trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
              thumbColor={theme.colors.switchThumb}
            />
          </View>
        </View>
      </View>

      <Button label={t("roomConfig.create")} onPress={handleCreate} fullWidth />
    </ModalSheet>
  );
}
