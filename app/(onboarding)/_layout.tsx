import { Stack } from "expo-router";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { theme } from "@/lib/theme";

export default function OnboardingLayout() {
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
