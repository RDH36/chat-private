import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";
import { RadioGroup } from "@/components/ui/RadioGroup";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
  getLockDelay,
  setLockDelay,
  verifyPin,
  storePin,
} from "@/lib/auth";
import { PinDots } from "@/components/lock/PinDots";
import { PinPad } from "@/components/lock/PinPad";

const DELAY_OPTIONS = [
  { labelKey: "security.immediate", ms: 0 },
  { labelKey: "security.1min", ms: 60_000 },
  { labelKey: "security.5min", ms: 300_000 },
  { labelKey: "security.15min", ms: 900_000 },
];

type PinStep = null | "verify" | "new" | "confirm";

export default function SecurityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [delay, setDelay] = useState(0);
  const [pinStep, setPinStep] = useState<PinStep>(null);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setBioAvailable(await isBiometricAvailable());
      setBioEnabled(await isBiometricEnabled());
      setDelay(await getLockDelay());
    })();
  }, []);

  const handleToggleBio = async (val: boolean) => {
    await setBiometricEnabled(val);
    setBioEnabled(val);
  };

  const handleDelayChange = async (ms: number) => {
    await setLockDelay(ms);
    setDelay(ms);
  };

  const shake = (msg: string) => {
    setShaking(true);
    setError(msg);
    setPin("");
    setTimeout(() => setShaking(false), 500);
  };

  const onDigitPress = useCallback(
    (digit: string) => {
      setPin((prev) => {
        const next = prev + digit;
        if (next.length < 6) return next;
        setTimeout(async () => {
          if (pinStep === "verify") {
            const valid = await verifyPin(next);
            if (valid) { setPinStep("new"); setPin(""); setError(""); }
            else { shake(t("security.wrongPin")); }
          } else if (pinStep === "new") {
            setNewPin(next); setPinStep("confirm"); setPin(""); setError("");
          } else if (pinStep === "confirm") {
            if (next === newPin) {
              await storePin(next);
              Alert.alert(t("security.success"), t("security.pinUpdated"));
              setPinStep(null); setPin(""); setNewPin("");
            } else {
              shake(t("security.pinMismatch"));
              setPinStep("new"); setNewPin("");
            }
          }
        }, 50);
        return next;
      });
    },
    [pinStep, newPin],
  );

  if (pinStep) {
    const titles: Record<string, string> = {
      verify: t("security.currentPin"),
      new: t("security.newPin"),
      confirm: t("security.confirmPin"),
    };
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
        <Pressable onPress={() => { setPinStep(null); setPin(""); }} style={{ position: "absolute", top: 64, left: 24 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "600", marginBottom: 4 }}>
          {titles[pinStep]}
        </Text>
        {error ? (
          <Text style={{ color: theme.colors.error, fontSize: 14 }}>{error}</Text>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>{t("security.digits")}</Text>
        )}
        <PinDots length={6} filled={pin.length} shaking={shaking} />
        <PinPad onDigitPress={onDigitPress} onDeletePress={() => setPin((p) => p.slice(0, -1))} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginLeft: 16 }}>
            {t("security.title")}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => setPinStep("verify")}
            style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16 }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>{t("security.changePin")}</Text>
          </Pressable>

          {bioAvailable && (
            <View style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>{t("security.biometrics")}</Text>
              <Switch
                value={bioEnabled}
                onValueChange={handleToggleBio}
                trackColor={{ true: theme.colors.accent, false: theme.colors.bgTertiary }}
                thumbColor={theme.colors.bg}
              />
            </View>
          )}
        </View>

        <Text style={{ color: theme.colors.textMuted, fontSize: 14, fontWeight: "600", marginTop: 24, marginBottom: 12 }}>
          {t("security.lockDelay")}
        </Text>
        <RadioGroup
          options={DELAY_OPTIONS.map((opt) => ({ label: t(opt.labelKey), value: opt.ms.toString() }))}
          selected={delay.toString()}
          onSelect={(value) => handleDelayChange(parseInt(value, 10))}
        />
      </View>
    </SafeAreaView>
  );
}
