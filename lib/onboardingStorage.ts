import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  completed: 'hp_onboarding_completed',
  nickname: 'hp_nickname',
  petId: 'hp_pet_id',
  welcomePending: 'hp_welcome_pending',
} as const

/** 유저 닉네임 상한 (한글 기준) */
export const NICKNAME_MAX = 8

export type PetChoice = 'mongi' | 'nami'

/** 홈 첫 진입 말풍선 종류 */
export type WelcomePendingKind = 'fresh' | 'resume'

function clampNickname(name: string): string {
  return name.trim().slice(0, NICKNAME_MAX)
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.completed)
  return v === '1'
}

export async function completeOnboarding(data: {
  nickname: string
  petId: PetChoice
}): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.completed, '1'],
    [KEYS.nickname, clampNickname(data.nickname)],
    [KEYS.petId, data.petId],
    [KEYS.welcomePending, 'fresh'],
  ])
}

export async function getOnboardingProfile(): Promise<{
  nickname: string
  petId: PetChoice
} | null> {
  const pairs = await AsyncStorage.multiGet([KEYS.nickname, KEYS.petId])
  const raw = pairs[0][1]
  const petId = pairs[1][1] as PetChoice | null
  if (!raw || !petId) return null
  return { nickname: clampNickname(raw), petId }
}

/** 온보딩/복구 직후 홈 환영 말풍선 — 한 번만 */
export async function consumeWelcomePending(): Promise<WelcomePendingKind | null> {
  const v = await AsyncStorage.getItem(KEYS.welcomePending)
  if (v == null) return null
  await AsyncStorage.removeItem(KEYS.welcomePending)
  if (v === 'resume') return 'resume'
  // 'fresh' 또는 구버전 '1'
  if (v === 'fresh' || v === '1') return 'fresh'
  return null
}

/** 기록 가져오기 성공 — 완료 표시 + 복구 환영 말풍선 */
export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.completed, '1'],
    [KEYS.welcomePending, 'resume'],
  ])
}

/** 온보딩을 처음부터 다시 보기 (개발/검수용) */
export async function resetOnboardingCompleted(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.completed,
    KEYS.nickname,
    KEYS.petId,
    KEYS.welcomePending,
  ])
}
