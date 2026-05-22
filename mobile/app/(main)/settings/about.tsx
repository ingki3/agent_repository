/**
 * S-21 · 정보 / 라이선스 (USER_FLOW S-21).
 *
 * Static informational screen: app version (from expo-constants), oss license
 * lookup (links out to the OSS notice page in the system browser), and terms /
 * privacy links. There is intentionally no network call here so the screen works
 * offline; the [←] header back is the default expo-router stack behaviour.
 */
import { Linking, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useTheme } from "@/design/theme";
import { fontSize, radius, space, touch } from "@/design/tokens";

const TERMS_URL = "https://agentclient.simplist.dev/legal/terms";
const PRIVACY_URL = "https://agentclient.simplist.dev/legal/privacy";
const OSS_URL = "https://agentclient.simplist.dev/legal/oss";

function appVersion(): string {
  const v = Constants.expoConfig?.version;
  return typeof v === "string" && v.length > 0 ? v : "0.0.0";
}

function bundleId(): string | null {
  return (
    Constants.expoConfig?.ios?.bundleIdentifier ??
    Constants.expoConfig?.android?.package ??
    null
  );
}

export default function AboutScreen() {
  const { color } = useTheme();
  const version = appVersion();
  const bundle = bundleId();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: color("surface") }}
      edges={["bottom"]}
    >
      <Stack.Screen options={{ title: "정보 / 라이선스" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.versionCard,
            {
              backgroundColor: color("surface-elevated"),
              borderColor: color("border"),
            },
          ]}
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`Agent Client 버전 ${version}`}
        >
          <Text style={[styles.appName, { color: color("text-primary") }]}>
            Agent Client
          </Text>
          <Text style={[styles.versionLabel, { color: color("text-secondary") }]}>
            앱 버전
          </Text>
          <Text style={[styles.versionValue, { color: color("text-primary") }]}>
            v{version}
          </Text>
          {bundle ? (
            <Text style={[styles.bundleId, { color: color("text-secondary") }]}>
              {bundle}
            </Text>
          ) : null}
        </View>

        <Section title="법적 고지">
          <LinkRow
            label="서비스 이용약관"
            description="외부 브라우저에서 열림"
            onPress={() => Linking.openURL(TERMS_URL)}
          />
          <Divider />
          <LinkRow
            label="개인정보 처리방침"
            description="외부 브라우저에서 열림"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <Divider />
          <LinkRow
            label="오픈소스 라이선스"
            description="외부 브라우저에서 열림"
            onPress={() => Linking.openURL(OSS_URL)}
          />
        </Section>

        <Text style={[styles.footer, { color: color("text-secondary") }]}>
          © 2026 Simplist. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  const { color } = useTheme();
  return (
    <View style={styles.section}>
      <Text
        style={[styles.sectionTitle, { color: color("text-secondary") }]}
        accessibilityRole="header"
      >
        {props.title}
      </Text>
      <View
        style={[
          styles.sectionBody,
          { borderColor: color("border"), backgroundColor: color("surface") },
        ]}
      >
        {props.children}
      </View>
    </View>
  );
}

function LinkRow(props: {
  label: string;
  description?: string;
  onPress: () => void;
}) {
  const { color } = useTheme();
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="link"
      accessibilityLabel={props.label}
      accessibilityHint={props.description}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? color("surface-elevated") : "transparent",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: color("text-primary") }]}>
          {props.label}
        </Text>
        {props.description ? (
          <Text style={[styles.rowDescription, { color: color("text-secondary") }]}>
            {props.description}
          </Text>
        ) : null}
      </View>
      <Text
        style={[styles.chevron, { color: color("text-secondary") }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        ↗
      </Text>
    </Pressable>
  );
}

function Divider() {
  const { color } = useTheme();
  return (
    <View style={[styles.divider, { backgroundColor: color("border") }]} />
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: space[4],
    gap: space[5],
    paddingBottom: space[8],
  },
  versionCard: {
    padding: space[5],
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space[2],
    alignItems: "flex-start",
  },
  appName: {
    fontSize: fontSize["title-md"],
    fontWeight: "700",
  },
  versionLabel: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: space[2],
  },
  versionValue: {
    fontSize: fontSize["title-lg"],
    fontWeight: "700",
  },
  bundleId: {
    fontSize: fontSize.caption,
    marginTop: space[1],
  },
  section: {
    gap: space[2],
  },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: space[2],
  },
  sectionBody: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touch.min,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  rowLabel: {
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  rowDescription: {
    fontSize: fontSize["body-sm"],
    marginTop: 2,
  },
  chevron: {
    fontSize: fontSize["title-md"],
    paddingLeft: space[3],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: space[4],
  },
  footer: {
    textAlign: "center",
    fontSize: fontSize.caption,
    marginTop: space[4],
  },
});
