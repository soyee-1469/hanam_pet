import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PetChoice } from './onboardingStorage'

const PET_NAME_KEY = 'hp_pet_name'

export const PET_NAME_MAX = 8

export function defaultPetName(petId: PetChoice): string {
  return petId === 'nami' ? '나미' : '몽이'
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

export async function setPetName(name: string): Promise<string> {
  const next = name.trim().slice(0, PET_NAME_MAX)
  await AsyncStorage.setItem(PET_NAME_KEY, next)
  return next
}
