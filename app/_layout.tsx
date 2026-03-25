import "@/lib/i18n";
import "@/global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  useFonts,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useCurrentUser, ensureSignedIn } from "@/lib/identity";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { useLockState } from "@/hooks/useLockState";
import { useOnboardingComplete } from "@/hooks/useOnboarding";
import { LockScreen } from "@/components/lock/LockScreen";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoomListSkeleton } from "@/components/home/RoomCardSkeleton";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  return (
    <ThemeProvider>
      {fontsLoaded ? <AppContent /> : <FontLoadingScreen />}
    </ThemeProvider>
  );
}

function FontLoadingScreen() {
  const { theme } = useTheme();
  return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
}

function AppContent() {
  const { theme, isDark } = useTheme();
  const { user, isLoading } = useCurrentUser();
  const { mode, unlock } = useLockState();
  const { isComplete: onboardingDone, isLoading: obLoading } = useOnboardingComplete();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading && !user) {
      ensureSignedIn();
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (isLoading || obLoading || !user || mode === "loading") return;

    const inOnboarding = segments[0] === "(onboarding)";

    if (!onboardingDone && !inOnboarding) {
      router.replace("/(onboarding)/quiz");
    }
  }, [isLoading, obLoading, user, mode, onboardingDone, segments]);

  if (isLoading || obLoading || !user || mode === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: 24, paddingTop: 60 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        {/* Header skeleton */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Skeleton width={140} height={28} borderRadius={8} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={18} />
            <Skeleton width={36} height={36} borderRadius={18} />
          </View>
        </View>
        {/* Search bar skeleton */}
        <Skeleton width="100%" height={44} borderRadius={12} style={{ marginBottom: 20 }} />
        {/* Section label skeleton */}
        <Skeleton width={160} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
        {/* Room cards skeleton */}
        <RoomListSkeleton count={5} />
      </View>
    );
  }

  if (!onboardingDone) {
    return (
      <KeyboardProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg },
            animation: "fade",
          }}
        />
      </KeyboardProvider>
    );
  }

  return (
    <KeyboardProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg },
            animation: "slide_from_right",
          }}
        />
        {(mode === "setup" || mode === "unlock") && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            <LockScreen initialMode={mode} onUnlock={unlock} />
          </View>
        )}
      </View>
    </KeyboardProvider>
  );
}
