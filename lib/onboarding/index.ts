import { ONBOARDING_VERSION } from './version'
import { onboardingCopyV1 } from './copy.v1'
import { onboardingCopyV2 } from './copy.v2'

export type OnboardingCopy = typeof onboardingCopyV1 | typeof onboardingCopyV2
export type TermKeyV1 = (typeof onboardingCopyV1.terms.items)[number]['key']

/** 현재 활성 온보딩 카피 */
export function getOnboardingCopy() {
  return ONBOARDING_VERSION === 'v2' ? onboardingCopyV2 : onboardingCopyV1
}

/** @deprecated getOnboardingCopy() 사용 권장 — 활성 버전 스냅샷 */
export const onboardingCopy = getOnboardingCopy()

export { onboardingCopyV1, onboardingCopyV2, ONBOARDING_VERSION }
