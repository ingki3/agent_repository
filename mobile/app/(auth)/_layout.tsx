/**
 * Auth route group — phone (S-02) / OTP (S-03) ship in M1 sub 2 (BIZ-270).
 * Foundation only declares the empty stack so Splash can route to `(auth)`
 * once the auth store hydrates.
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
