/**
 * S-20 · 설정 (USER_FLOW S-20, PRD §3 UC-01 / §4 FR-04).
 *
 * Profile card with redacted phone number, navigation to S-21 (정보/라이선스), and
 * the D-05 logout entry point. The header back-button returns to S-10 (Inbox)
 * via expo-router default behaviour because this screen is pushed on top of the
 * root stack — see app/_layout.tsx.
 */
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/design/theme";
import { fontSize, radius, space, touch } from "@/design/tokens";
import { useAuthStore } from "@/application/stores/auth";
import { maskE164ForDisplay } from "@/domain/value-objects/phone";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { defaultSignOutDeps, signOut } from "@/application/usecases/auth/sign-out";

export default function SettingsScreen() {
  const { color } = useTheme();
  const router = useRouter();
  const phone = useAuthStore((s) => s.phoneE164);
  const masked = useMemo(() => maskE164ForDisplay(phone), [phone]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [pending, setPending] = useState(false);

  const handleLogout = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      // No additional Zustand store resetters are registered in this slice;
      // BIZ-264 (buddies/chat/trace/ui/network stores) will pass its resetters here.
      await signOut(defaultSignOutDeps([]));
      // useAuthStore is now `guest`; root layout's useProtectedRoute() will
      // replace navigation to /(auth)/phone (= S-01) on the next tick.
    } finally {
      setPending(false);
      setDialogVisible(false);
    }
  }, [pending]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: color("surface") }}
      edges={["bottom"]}
    >
      <Stack.Screen options={{ title: "설정" }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: color("surface-elevated"),
              borderColor: color("border"),
            },
          ]}
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`현재 로그인 전화번호 ${masked || "정보 없음"}`}
        >
          <View
            style={[styles.avatar, { backgroundColor: color("primary") }]}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <Text style={[styles.avatarGlyph, { color: color("on-primary") }]}>
              {phone ? "📱" : "?"}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileLabel, { color: color("text-secondary") }]}>
              로그인된 전화번호
            </Text>
            <Text
              style={[styles.profilePhone, { color: color("text-primary") }]}
              testID="settings-profile-phone"
            >
              {masked || "정보 없음"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { borderColor: color("border"), backgroundColor: color("surface") },
          ]}
        >
          <SettingsRow
            label="정보 / 라이선스"
            description="앱 버전과 오픈소스 라이선스, 약관 보기"
            onPress={() => router.push("/(main)/settings/about")}
            accessibilityHint="앱 정보와 라이선스 화면으로 이동합니다"
          />
        </View>

        <View
          style={[
            styles.section,
            { borderColor: color("border"), backgroundColor: color("surface") },
          ]}
        >
          <SettingsRow
            label="로그아웃"
            description="인증 토큰·봇 토큰·로컬 캐시가 모두 삭제됩니다"
            danger
            onPress={() => setDialogVisible(true)}
            accessibilityHint="로그아웃 확인 다이얼로그를 엽니다"
          />
        </View>
      </ScrollView>

      <LogoutConfirmDialog
        visible={dialogVisible}
        pending={pending}
        onCancel={() => {
          if (!pending) setDialogVisible(false);
        }}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

function SettingsRow(props: {
  label: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
}) {
  const { color } = useTheme();
  const labelColor = props.danger ? color("error") : color("text-primary");
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityHint={props.accessibilityHint}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? color("surface-elevated") : "transparent",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: labelColor }]}>{props.label}</Text>
        {props.description ? (
          <Text style={[styles.rowDescription, { color: color("text-secondary") }]}>
            {props.description}
          </Text>
        ) : null}
      </View>
      {!props.danger && (
        <Text
          style={[styles.chevron, { color: color("text-secondary") }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          ›
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: space[4],
    gap: space[4],
    paddingBottom: space[8],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlyph: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileText: {
    flex: 1,
    gap: space[1],
  },
  profileLabel: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profilePhone: {
    fontSize: fontSize["title-md"],
    fontWeight: "700",
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    minHeight: touch.min,
    paddingVertical: space[4],
    paddingHorizontal: space[4],
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  rowDescription: {
    fontSize: fontSize["body-sm"],
    lineHeight: 18,
    marginTop: 2,
  },
  chevron: {
    fontSize: fontSize["title-md"],
    paddingLeft: space[3],
  },
});
