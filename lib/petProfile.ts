import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PetChoice } from './onboardingStorage'

const PET_NAME_KEY = 'hp_pet_name'

export const PET_NAME_MAX = 8

export function defaultPetName(petId: PetChoice): string {
  return petId === 'nami' ? '나미' : '하치'
}

export async function getPetName(petId: PetChoice = 'mongi'): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(PET_NAME_KEY)
    const name = saved?.trim()
    if (name) return name.slice(0, PET_NAME_MAX)
  } catch {
    // ignore
  }
  return defaultPetName(petId)
}

/** 저장된 원본(비우면 빈 문자열). 설정 편집용 — 기본값으로 채우지 않음 */
export async function getStoredPetName(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(PET_NAME_KEY)
    return (saved ?? '').trim().slice(0, PET_NAME_MAX)
  } catch {
    return ''
  }
}

export async function setPetName(name: string): Promise<string> {
  const next = name.trim().slice(0, PET_NAME_MAX)
  if (!next) {
    await AsyncStorage.removeItem(PET_NAME_KEY)
    return ''
  }
  await AsyncStorage.setItem(PET_NAME_KEY, next)
  return next
}
