import { Stack } from "expo-router";
import { useTheme } from "@/design/theme";

export default function MainLayout() {
  const { color } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: color("surface") },
        headerTintColor: color("text-primary"),
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: color("surface") },
      }}
    >
      <Stack.Screen name="settings/index" options={{ title: "설정" }} />
      <Stack.Screen name="settings/about" options={{ title: "정보 / 라이선스" }} />
    </Stack>
  );
}
