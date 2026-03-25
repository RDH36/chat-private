import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  isFirstLaunch,
  shouldLock,
  setLastBackground,
} from "@/lib/auth";

type LockMode = "loading" | "setup" | "unlock" | "unlocked";

let _lockSuppressed = false;
export function suppressLock() { _lockSuppressed = true; }
export function unsuppressLock() { _lockSuppressed = false; }

export function useLockState() {
  const [mode, setMode] = useState<LockMode>("loading");
  const appState = useRef(AppState.currentState);

  const checkLock = useCallback(async () => {
    const firstLaunch = await isFirstLaunch();
    if (firstLaunch) {
      setMode("setup");
      return;
    }

    const needsLock = await shouldLock();
    setMode(needsLock ? "unlock" : "unlocked");
  }, []);

  useEffect(() => {
    checkLock();
  }, [checkLock]);

  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      async (nextState: AppStateStatus) => {
        if (appState.current === "active" && nextState.match(/inactive|background/)) {
          if (!_lockSuppressed) {
            await setLastBackground();
          }
        }

        if (nextState === "active" && appState.current.match(/inactive|background/)) {
          if (!_lockSuppressed) {
            const needsLock = await shouldLock();
            if (needsLock) setMode("unlock");
          }
        }

        appState.current = nextState;
      }
    );

    return () => sub.remove();
  }, []);

  const unlock = useCallback(() => setMode("unlocked"), []);
  const lock = useCallback(() => setMode("unlock"), []);

  return { mode, unlock, lock, checkLock };
}
