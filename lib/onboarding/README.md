# 온보딩 버전

| 버전 | 상태 | 설명 |
|------|------|------|
| **v1** | `ONBOARDING_VERSION = 'v1'` | UX 개선 + 중간 분량 카피 |
| **v2** (활성) | `ONBOARDING_VERSION = 'v2'` | 피그마 스토리보드 원문에 가까운 카피 |

- 스위치: `lib/onboarding/version.ts`
- 카피: `copy.v1.ts`, `copy.v2.ts`
- 화면은 `getOnboardingCopy()`로 활성 버전 문구를 읽습니다.

v2 추가 화면: `/onboarding/restore-code` (기록 가져오기 번호)
