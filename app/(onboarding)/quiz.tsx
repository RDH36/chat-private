import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { QuizOption } from "@/components/onboarding/QuizOption";
import { useOnboardingContext, type EmpathyProfile } from "@/hooks/useOnboarding";
import { useTheme } from "@/lib/theme";

type QuizQuestion = {
  key: string;
  titleKey: string;
  options: { labelKey: string; value: EmpathyProfile }[];
};

const QUESTIONS: QuizQuestion[] = [
  {
    key: "q1",
    titleKey: "onboarding.q1",
    options: [
      { labelKey: "onboarding.q1a", value: "watcher" },
      { labelKey: "onboarding.q1b", value: "exposed" },
      { labelKey: "onboarding.q1c", value: "ghost" },
    ],
  },
  {
    key: "q2",
    titleKey: "onboarding.q2",
    options: [
      { labelKey: "onboarding.q2a", value: "watcher" },
      { labelKey: "onboarding.q2b", value: "exposed" },
      { labelKey: "onboarding.q2c", value: "ghost" },
    ],
  },
  {
    key: "q3",
    titleKey: "onboarding.q3",
    options: [
      { labelKey: "onboarding.q3a", value: "watcher" },
      { labelKey: "onboarding.q3b", value: "exposed" },
      { labelKey: "onboarding.q3c", value: "ghost" },
    ],
  },
];

export default function QuizScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAnswer } = useOnboardingContext();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = QUESTIONS[step];

  const handleSelect = (value: EmpathyProfile) => {
    if (selected) return;
    setSelected(value);
    setAnswer(question.key, value);
    setTimeout(() => {
      setSelected(null);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        router.replace("/(onboarding)/empathy");
      }
    }, 400);
  };

  return (
    <OnboardingShell step={step + 1}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Animated.Text
          key={`title-${step}`}
          entering={FadeInDown.duration(400)}
          style={{
            fontSize: theme.font.size.xxl,
            fontWeight: theme.font.weight.bold,
            color: theme.colors.text,
            lineHeight: 32,
            marginBottom: theme.spacing.sm,
          }}
        >
          {t(question.titleKey)}
        </Animated.Text>

        <Animated.Text
          key={`sub-${step}`}
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            fontSize: theme.font.size.sm,
            color: theme.colors.textMuted,
            marginBottom: theme.spacing.xxl,
          }}
        >
          {t("onboarding.quizSubtitle")}
        </Animated.Text>

        <Animated.View key={`opts-${step}`} entering={FadeInDown.delay(200).duration(400)}>
          {question.options.map((opt) => (
            <QuizOption key={opt.value} label={t(opt.labelKey)} selected={selected === opt.value} onPress={() => handleSelect(opt.value)} />
          ))}
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}
