# Agent Client

Agent Client는 1인 사용자가 모바일에서 다중 AI 에이전트(SimpleClaw, OpenClaw 등)와 Telegram 호환 UX로 대화하며 작업을 위임할 수 있게 해주는 전용 메신저 앱입니다.

## 문서
- [Product Requirements Document (PRD)](./PRD.md)
- [User Flow & Screen Design](./USER_FLOW.md)
- 디자인 SoT: [`AgentClient.pen`](./AgentClient.pen) (Pencil 앱으로만 열기)

## 기술 스택
- 프레임워크: React Native (Expo, Expo Router)
- 상태 관리: Zustand
- 로컬 저장소: SQLite (expo-sqlite) — 1차 빌드는 in-memory mock
- 모바일 네이티브 연동: @react-native-voice/voice (예정), expo-speech, expo-secure-store
- 언어: TypeScript

## Mockup 빌드 (BIZ-230)

P0 사용성 테스트용 mock 빌드는 `mobile/` 디렉토리에 있습니다. **백엔드 연동 없이 mock fixture 로만 동작**합니다.

### 사전 요구
- Node.js 20 이상 (개발은 22.22.0 에서 검증)
- npm 10 이상
- iOS 시뮬레이터 (Xcode) 또는 Android 에뮬레이터 또는 Expo Go 실기기

### 설치 & 실행

```bash
cd mobile
npm install
npx expo start
```

`expo start` 실행 후 터미널의 안내에 따라 단축키 선택:

| 키 | 동작 |
|----|-----|
| `i` | iOS 시뮬레이터에서 열기 |
| `a` | Android 에뮬레이터에서 열기 |
| `w` | 웹 브라우저(Expo Web)에서 열기 |
| QR 스캔 | Expo Go 실기기에서 열기 (LAN) |

LAN 으로 실기기 연결이 안 되면 터널 모드:

```bash
npx expo start --tunnel
```

### 기타 명령어

```bash
cd mobile
npm run typecheck   # tsc --noEmit
npm run web         # Expo Web 빠른 실행 (사용성 테스트 미리보기용)
```

### P0 화면

| 화면 ID | 라우트 | 컴포넌트 | pen frame (Light / Dark) |
|---------|--------|---------|--------------------------|
| S-20 통합 Inbox | `/` | `app/index.tsx` | ENx49 / pHwKo |
| S-21 버디 목록 | `/buddies` | `app/buddies.tsx` | JCqD4 / svfdd |
| S-22 채팅 | `/chat/[id]` | `app/chat/[id].tsx` | YWrBi / q9HQt |
| M-01 버디 추가 (모달) | `/add-buddy` | `app/add-buddy.tsx` | N3X6FI / inuhZ |

P1·P2(세션 히스토리·알림 설정·STT/TTS·인라인 카드 5종·Trace 펼침) 는 별도 sub-issue 로 분기됩니다.

### Mock fixtures

- `mobile/src/mock/fixtures.ts` — Work Buddy / Life Buddy / Knowledge Keeper 3개 버디 + 4건 메시지 + Trace 요약 칩 데이터
- `mobile/src/store/buddies.ts`, `mobile/src/store/messages.ts` — Zustand store, in-memory 만 유지 (앱 재실행 시 초기화)
