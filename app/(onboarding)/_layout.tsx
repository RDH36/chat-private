import { Stack } from "expo-router";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { useTheme } from "@/lib/theme";

export default function OnboardingLayout() {
  const { theme } = useTheme();
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: "fade",
        }}
      />
    </OnboardingProvider>
  );
}
