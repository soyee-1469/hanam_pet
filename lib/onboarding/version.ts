/**
 * 온보딩 버전 스위치
 *
 * - v1: UX 개선 + 중간 분량 카피
 * - v2: 피그마 스토리보드 원문에 가깝게
 */
export type OnboardingVersion = 'v1' | 'v2'

export const ONBOARDING_VERSION: OnboardingVersion = 'v2'

export const ONBOARDING_VERSION_LABEL: Record<OnboardingVersion, string> = {
  v1: '온보딩 버전1 (UX 중간 분량)',
  v2: '온보딩 버전2 (스토리보드 원문)',
}
