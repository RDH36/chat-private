import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { useTheme } from "@/lib/theme";
import { ModalSheet } from "@/components/ui/ModalSheet";

type Step = "email" | "code" | "success";

interface EmailLinkSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function EmailLinkSheet({
  visible,
  onClose,
  title,
  subtitle,
}: EmailLinkSheetProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const resolvedTitle = title ?? t("auth.protectTitle");
  const resolvedSubtitle = subtitle ?? t("auth.protectSubtitle");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setStep("code");
    } catch (err: any) {
      setError(err.body?.message ?? t("auth.sendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() });
      setStep("success");
    } catch (err: any) {
      setError(err.body?.message ?? t("auth.invalidCode"));
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalSheet visible={visible} onClose={handleClose} title={resolvedTitle}>
      {step === "email" && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{resolvedSubtitle}</Text>
          <TextInput
            placeholder={t("auth.emailPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onSubmitEditing={handleSendCode}
            style={{
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.text,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
            }}
          />
          {error ? <Text style={{ color: theme.colors.error, fontSize: 14 }}>{error}</Text> : null}
          <Pressable
            onPress={handleSendCode}
            disabled={loading || !email.trim()}
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading || !email.trim() ? 0.4 : 1,
            }}
          >
            <Text style={{ color: theme.colors.accentText, fontSize: 16, fontWeight: "bold" }}>
              {t("auth.sendCode")}
            </Text>
          </Pressable>
        </View>
      )}

      {step === "code" && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
            {t("auth.codeSent", { email })}
          </Text>
          <TextInput
            placeholder={t("auth.codePlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            onSubmitEditing={handleVerifyCode}
            style={{
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.text,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 20,
              textAlign: "center",
              letterSpacing: 6,
            }}
          />
          {error ? <Text style={{ color: theme.colors.error, fontSize: 14 }}>{error}</Text> : null}
          <Pressable
            onPress={handleVerifyCode}
            disabled={loading || !code.trim()}
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading || !code.trim() ? 0.4 : 1,
            }}
          >
            <Text style={{ color: theme.colors.accentText, fontSize: 16, fontWeight: "bold" }}>
              {t("auth.verify")}
            </Text>
          </Pressable>
          <Pressable onPress={() => { setStep("email"); setError(""); setCode(""); }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: "center" }}>
              {t("auth.changeEmail")}
            </Text>
          </Pressable>
        </View>
      )}

      {step === "success" && (
        <View style={{ gap: 16, alignItems: "center" }}>
          <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent} />
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
            {t("auth.successTitle")}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: "center" }}>
            {t("auth.successMessage", { email })}
          </Text>
          <Pressable
            onPress={handleClose}
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={{ color: theme.colors.accentText, fontSize: 16, fontWeight: "bold" }}>
              {t("auth.close")}
            </Text>
          </Pressable>
        </View>
      )}
    </ModalSheet>
  );
}
