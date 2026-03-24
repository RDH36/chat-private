import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { sha256 } from "js-sha256";

const KEYS = {
  PIN_HASH: "app_pin_hash",
  BIOMETRIC: "biometric_enabled",
  LOCK_DELAY: "lock_delay_ms",
  LAST_BG: "last_background_at",
  FAIL_COUNT: "pin_fail_count",
  LOCKOUT_UNTIL: "pin_lockout_until",
} as const;

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

// --- PIN ---

export async function isFirstLaunch(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
  return !hash;
}

export function hashPin(pin: string): string {
  return sha256(pin);
}

export async function storePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PIN_HASH, hashPin(pin));
}

export async function verifyPin(enteredPin: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
  return hashPin(enteredPin) === storedHash;
}

// --- Biometrics ---

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(KEYS.BIOMETRIC);
  return val === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.BIOMETRIC, String(enabled));
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Déverrouiller l'app",
    fallbackLabel: "Utiliser le PIN",
    disableDeviceFallback: true,
  });

  return result.success;
}

// --- Lock delay ---

export async function getLockDelay(): Promise<number> {
  const val = await SecureStore.getItemAsync(KEYS.LOCK_DELAY);
  return val ? parseInt(val, 10) : 0;
}

export async function setLockDelay(ms: number): Promise<void> {
  await SecureStore.setItemAsync(KEYS.LOCK_DELAY, String(ms));
}

export async function setLastBackground(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.LAST_BG, Date.now().toString());
}

export async function shouldLock(): Promise<boolean> {
  const lastBg = await SecureStore.getItemAsync(KEYS.LAST_BG);
  const delay = await getLockDelay();

  if (!lastBg) return true;
  return Date.now() - parseInt(lastBg, 10) > delay;
}

// --- Lockout ---

export async function getFailCount(): Promise<number> {
  const val = await SecureStore.getItemAsync(KEYS.FAIL_COUNT);
  return val ? parseInt(val, 10) : 0;
}

export async function incrementFailCount(): Promise<number> {
  const count = (await getFailCount()) + 1;
  await SecureStore.setItemAsync(KEYS.FAIL_COUNT, String(count));

  if (count >= MAX_ATTEMPTS) {
    const until = Date.now() + LOCKOUT_MS;
    await SecureStore.setItemAsync(KEYS.LOCKOUT_UNTIL, String(until));
  }

  return count;
}

export async function resetFailCount(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.FAIL_COUNT, "0");
  await SecureStore.deleteItemAsync(KEYS.LOCKOUT_UNTIL);
}

export async function getLockoutRemaining(): Promise<number> {
  const until = await SecureStore.getItemAsync(KEYS.LOCKOUT_UNTIL);
  if (!until) return 0;
  const remaining = parseInt(until, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
}
