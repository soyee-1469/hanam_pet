import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'hp_energy_care_nudge'

/** 대화 에너지 소진 → 펫 홈으로 올 때 교감 안내 */
export async function setEnergyCareNudge(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1')
  } catch {
    // ignore
  }
}

export async function consumeEnergyCareNudge(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY)
    if (v == null) return false
    await AsyncStorage.removeItem(KEY)
    return true
  } catch {
    return false
  }
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}
