import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onboarding_complete";

// Simple event to notify _layout.tsx when onboarding completes
const listeners = new Set<() => void>();
function notifyComplete() {
  listeners.forEach((fn) => fn());
}

// --- Types ---

export type EmpathyProfile = "watcher" | "exposed" | "ghost";

type OnboardingContextValue = {
  answers: Record<string, EmpathyProfile>;
  setAnswer: (key: string, value: EmpathyProfile) => void;
  profile: EmpathyProfile;
  markComplete: () => Promise<void>;
};

// --- Empathy profile computation ---

export function computeProfile(answers: Record<string, EmpathyProfile>): EmpathyProfile {
  const values = Object.values(answers);
  if (values.length === 0) return "ghost";

  const counts: Record<EmpathyProfile, number> = { watcher: 0, exposed: 0, ghost: 0 };
  for (const v of values) counts[v]++;

  const max = Math.max(counts.watcher, counts.exposed, counts.ghost);
  if (counts.watcher === max && counts.exposed !== max && counts.ghost !== max) return "watcher";
  if (counts.exposed === max && counts.watcher !== max && counts.ghost !== max) return "exposed";
  if (counts.ghost === max && counts.watcher !== max && counts.exposed !== max) return "ghost";

  // Tie: use Q3 answer, fallback to ghost
  return answers.q3 ?? "ghost";
}

// --- Context ---

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, EmpathyProfile>>({});

  const setAnswer = useCallback((key: string, value: EmpathyProfile) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const profile = computeProfile(answers);

  const markComplete = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    notifyComplete();
  }, []);

  return (
    <OnboardingContext.Provider value={{ answers, setAnswer, profile, markComplete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardingContext must be inside OnboardingProvider");
  return ctx;
}

// --- Hook for checking completion (used in _layout.tsx) ---

export function useOnboardingComplete() {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      setIsComplete(val === "true");
      setIsLoading(false);
    });

    const handler = () => setIsComplete(true);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return { isComplete, isLoading };
}
