import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/design/theme";
import { useAuthStore } from "@/application/stores/auth";

function useProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "initializing") return;
    const inAuthGroup = segments[0] === "(auth)";
    if (status === "auth" && inAuthGroup) {
      router.replace("/");
    } else if (status !== "auth" && !inAuthGroup) {
      // guest or awaiting_code → must be in (auth) flow
      router.replace("/(auth)/phone");
    }
  }, [status, segments, router]);
}

function Splash() {
  const { color } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color("surface"),
      }}
    >
      <ActivityIndicator color={color("primary")} />
    </View>
  );
}

function StackWithTheme() {
  const { color, mode } = useTheme();
  const status = useAuthStore((s) => s.status);
  useProtectedRoute();

  if (status === "initializing") {
    return (
      <>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <Splash />
      </>
    );
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: color("surface") },
          headerTintColor: color("text-primary"),
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: color("surface") },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Inbox" }} />
        <Stack.Screen name="buddies" options={{ title: "버디 목록" }} />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: "채팅", headerBackButtonDisplayMode: "minimal" }}
        />
        <Stack.Screen
          name="add-buddy"
          options={{ presentation: "modal", title: "버디 추가" }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StackWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
