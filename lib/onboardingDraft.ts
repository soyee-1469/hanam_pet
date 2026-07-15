import type { PetChoice } from './onboardingStorage'

export type OnboardingDraft = {
  nickname: string
  petId: PetChoice | null
}

let draft: OnboardingDraft = {
  nickname: '',
  petId: null,
}

export function getOnboardingDraft(): OnboardingDraft {
  return { ...draft }
}

export function setOnboardingDraft(partial: Partial<OnboardingDraft>): void {
  draft = { ...draft, ...partial }
}

export function resetOnboardingDraft(): void {
  draft = { nickname: '', petId: null }
}

/** Setup flow progress after gate (intro → … → ai-notice) */
export const ONBOARDING_STEPS = 5 as const
