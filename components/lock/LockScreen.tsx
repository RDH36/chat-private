import { useState, useEffect, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EaseView } from "react-native-ease";
import { useTranslation } from "react-i18next";
import { PinDots } from "@/components/lock/PinDots";
import { PinPad } from "@/components/lock/PinPad";
import { useTheme } from "@/lib/theme";
import {
  verifyPin,
  storePin,
  authenticateWithBiometrics,
  isBiometricEnabled,
  isBiometricAvailable,
  setBiometricEnabled,
  incrementFailCount,
  resetFailCount,
  getLockoutRemaining,
} from "@/lib/auth";

const PIN_LENGTH = 6;

type Mode = "setup" | "confirm" | "unlock";

type Props = {
  initialMode: "setup" | "unlock";
  onUnlock: () => void;
};

export function LockScreen({ initialMode, onUnlock }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pin, setPin] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState("");
  const [lockoutMs, setLockoutMs] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (initialMode === "unlock") {
      tryBiometrics();
    }
  }, [initialMode]);

  useEffect(() => {
    if (lockoutMs <= 0) return;
    const interval = setInterval(() => {
      setLockoutMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutMs]);

  const tryBiometrics = useCallback(async () => {
    const enabled = await isBiometricEnabled();
    if (!enabled) return;
    const success = await authenticateWithBiometrics();
    if (success) handleUnlock();
  }, []);

  const handleUnlock = useCallback(() => {
    resetFailCount();
    setUnlocked(true);
    setTimeout(() => onUnlock(), 300);
  }, [onUnlock]);

  const shake = useCallback((msg: string) => {
    setShaking(true);
    setError(msg);
    setPin("");
    setTimeout(() => setShaking(false), 500);
  }, []);

  const onDigitPress = useCallback(
    (digit: string) => {
      if (lockoutMs > 0) return;

      setPin((prev) => {
        const next = prev + digit;
        if (next.length < PIN_LENGTH) return next;

        setTimeout(async () => {
          if (mode === "setup") {
            setSetupPin(next);
            setMode("confirm");
            setPin("");
            setError("");
          } else if (mode === "confirm") {
            if (next === setupPin) {
              await storePin(next);
              const bioAvailable = await isBiometricAvailable();
              if (bioAvailable) await setBiometricEnabled(true);
              handleUnlock();
            } else {
              shake(t("lock.pinMismatch"));
              setMode("setup");
              setSetupPin("");
            }
          } else {
            const valid = await verifyPin(next);
            if (valid) {
              handleUnlock();
            } else {
              const count = await incrementFailCount();
              if (count >= 5) {
                const remaining = await getLockoutRemaining();
                setLockoutMs(remaining);
                shake(t("lock.tooManyAttempts"));
              } else {
                shake(t("lock.wrongPin", { remaining: 5 - count }));
              }
            }
          }
        }, 50);

        return next;
      });
    },
    [mode, setupPin, lockoutMs, shake, handleUnlock]
  );

  const onDeletePress = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const title =
    mode === "setup"
      ? t("lock.createPin")
      : mode === "confirm"
        ? t("lock.confirmPin")
        : t("lock.enterPin");

  return (
    <EaseView
      animate={{ opacity: unlocked ? 0 : 1 }}
      transition={{ type: "timing", duration: 300, easing: "easeOut" }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <Ionicons name="lock-closed-outline" size={32} color={theme.colors.text} style={{ marginBottom: 8 }} />
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 4, color: theme.colors.text }}>{title}</Text>

        {error ? (
          <Text style={{ fontSize: 14, color: theme.colors.error }}>{error}</Text>
        ) : (
          <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>{t("lock.digits")}</Text>
        )}

        {lockoutMs > 0 && (
          <Text style={{ fontSize: 14, color: theme.colors.error, marginTop: 8 }}>
            {t("lock.retryIn", { seconds: Math.ceil(lockoutMs / 1000) })}
          </Text>
        )}

        <PinDots length={PIN_LENGTH} filled={pin.length} shaking={shaking} />

        <PinPad
          onDigitPress={onDigitPress}
          onDeletePress={onDeletePress}
          disabled={lockoutMs > 0}
        />
      </View>
    </EaseView>
  );
}
