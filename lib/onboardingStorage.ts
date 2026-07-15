import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  completed: 'hp_onboarding_completed',
  nickname: 'hp_nickname',
  petId: 'hp_pet_id',
} as const

export type PetChoice = 'mongi' | 'nami'

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
    [KEYS.nickname, data.nickname],
    [KEYS.petId, data.petId],
  ])
}

export async function getOnboardingProfile(): Promise<{
  nickname: string
  petId: PetChoice
} | null> {
  const pairs = await AsyncStorage.multiGet([KEYS.nickname, KEYS.petId])
  const nickname = pairs[0][1]
  const petId = pairs[1][1] as PetChoice | null
  if (!nickname || !petId) return null
  return { nickname, petId }
}

/** Dev / resume dummy — mark completed without wizard */
export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(KEYS.completed, '1')
}
