import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressBar } from "./ProgressBar";
import { theme } from "@/lib/theme";

type Props = {
  step: number;
  total?: number;
  children: React.ReactNode;
};

export function OnboardingShell({ step, total = 4, children }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
        <ProgressBar step={step} total={total} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.xl }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
