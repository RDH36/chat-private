import "@/lib/i18n";
import "@/global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useCurrentUser, ensureSignedIn } from "@/lib/identity";
import { theme } from "@/lib/theme";
import { useLockState } from "@/hooks/useLockState";
import { useOnboardingComplete } from "@/hooks/useOnboarding";
import { LockScreen } from "@/components/lock/LockScreen";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoomListSkeleton } from "@/components/home/RoomCardSkeleton";

export default function RootLayout() {
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
        <StatusBar style={theme.statusBar} />
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

  if (mode === "setup" || mode === "unlock") {
    return (
      <KeyboardProvider>
        <StatusBar style={theme.statusBar} />
        <LockScreen initialMode={mode} onUnlock={unlock} />
      </KeyboardProvider>
    );
  }

  return (
    <KeyboardProvider>
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: "slide_from_right",
        }}
      />
    </KeyboardProvider>
  );
}
