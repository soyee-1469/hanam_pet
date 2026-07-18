import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'hp_coachmark_welcome_v1'

export type CoachmarkWelcomeStatus = 'pending' | 'skipped' | 'accepted'

export async function getCoachmarkWelcomeStatus(): Promise<CoachmarkWelcomeStatus> {
  try {
    const v = await AsyncStorage.getItem(KEY)
    if (v === 'skipped' || v === 'accepted') return v
  } catch {
    // ignore
  }
  return 'pending'
}

export async function setCoachmarkWelcomeStatus(
  status: 'skipped' | 'accepted',
): Promise<void> {
  await AsyncStorage.setItem(KEY, status)
}

/** 개발/검수: 다시 보기 */
export async function resetCoachmarkWelcome(): Promise<void> {
  await AsyncStorage.removeItem(KEY)
}
