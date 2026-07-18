import type { PetChoice } from './onboardingStorage'
import { ONBOARDING_VERSION } from './onboarding/version'

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50plus'
export type GenderChoice = 'female' | 'male' | 'unspecified'

export type OnboardingDraft = {
  nickname: string
  ageGroup: AgeGroup | null
  gender: GenderChoice | null
  petId: PetChoice | null
  petName: string
}

let draft: OnboardingDraft = {
  nickname: '',
  ageGroup: null,
  gender: null,
  petId: null,
  petName: '',
}

export function getOnboardingDraft(): OnboardingDraft {
  return { ...draft }
}

export function setOnboardingDraft(partial: Partial<OnboardingDraft>): void {
  draft = { ...draft, ...partial }
}

export function resetOnboardingDraft(): void {
  draft = {
    nickname: '',
    ageGroup: null,
    gender: null,
    petId: null,
    petName: '',
  }
}

/** Setup flow progress after gate (terms → pet → profile → [restore] → welcome) */
export const ONBOARDING_STEPS = ONBOARDING_VERSION === 'v2' ? 5 : 4
