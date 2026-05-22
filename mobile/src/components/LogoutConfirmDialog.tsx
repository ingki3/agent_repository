/**
 * D-05 · 로그아웃 확인 다이얼로그 (USER_FLOW D-05).
 *
 * Modal overlay listing the data that will be wiped (auth + bot tokens + local
 * cache) and two actions: [로그아웃] (destructive) and [취소]. Focus management
 * sends VoiceOver/TalkBack to the dialog title on open per the task's accessibility
 * requirement; the destructive button uses the design system error color so the
 * intent is unambiguous in either theme.
 */
import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
} from 'react-native';
import { useTheme } from '@/design/theme';
import { fontSize, radius, space, touch } from '@/design/tokens';

export interface LogoutConfirmDialogProps {
  visible: boolean;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const IMPACT_LINES = [
  '인증 토큰과 자동 로그인 정보',
  '연결된 봇 토큰',
  '대화·친구·전송 대기 메시지 캐시',
];

export function LogoutConfirmDialog(props: LogoutConfirmDialogProps) {
  const { color } = useTheme();
  const titleRef = useRef<View | null>(null);

  useEffect(() => {
    if (!props.visible) return;
    const handle = setTimeout(() => {
      const node = titleRef.current ? findNodeHandle(titleRef.current) : null;
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, 60);
    return () => clearTimeout(handle);
  }, [props.visible]);

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.pending ? undefined : props.onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop} accessibilityRole="alert">
        <View
          style={[
            styles.card,
            { backgroundColor: color('surface'), borderColor: color('border') },
          ]}
        >
          <View
            ref={titleRef}
            accessibilityRole="header"
            accessible
            accessibilityLabel="로그아웃 확인"
          >
            <Text
              style={[styles.title, { color: color('text-primary') }]}
            >
              로그아웃 하시겠어요?
            </Text>
          </View>

          <Text style={[styles.body, { color: color('text-secondary') }]}>
            로그아웃하면 다음 정보가 이 기기에서 삭제됩니다.
          </Text>

          <View style={styles.impactList}>
            {IMPACT_LINES.map((line) => (
              <View key={line} style={styles.impactRow}>
                <View
                  style={[styles.dot, { backgroundColor: color('text-secondary') }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <Text style={[styles.impactText, { color: color('text-primary') }]}>
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.note, { color: color('text-secondary') }]}>
            서버 세션 해제는 네트워크가 가능한 경우에만 수행되며, 로컬 정리는 항상 완료됩니다.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={props.onCancel}
              disabled={props.pending}
              accessibilityRole="button"
              accessibilityLabel="취소"
              style={({ pressed }) => [
                styles.button,
                {
                  borderColor: color('border-strong'),
                  backgroundColor: pressed ? color('surface-elevated') : 'transparent',
                  opacity: props.pending ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={[styles.buttonLabel, { color: color('text-primary') }]}
              >
                취소
              </Text>
            </Pressable>

            <Pressable
              onPress={props.onConfirm}
              disabled={props.pending}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              accessibilityState={{ busy: props.pending }}
              style={({ pressed }) => [
                styles.button,
                styles.destructive,
                {
                  backgroundColor: color('error'),
                  borderColor: color('error'),
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {props.pending ? (
                <ActivityIndicator color={color('on-primary')} />
              ) : (
                <Text
                  style={[styles.buttonLabel, { color: color('on-primary') }]}
                >
                  로그아웃
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
  card: {
    borderRadius: radius.xl,
    padding: space[6],
    gap: space[3],
    borderWidth: 1,
  },
  title: {
    fontSize: fontSize['title-md'],
    fontWeight: '700',
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  impactList: {
    gap: space[2],
    paddingVertical: space[2],
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  impactText: {
    fontSize: fontSize['body-sm'],
    lineHeight: 20,
    flexShrink: 1,
  },
  note: {
    fontSize: fontSize.caption,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[3],
  },
  button: {
    flex: 1,
    minHeight: touch.min,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  destructive: {},
  buttonLabel: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
});
