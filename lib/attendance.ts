import AsyncStorage from '@react-native-async-storage/async-storage'
import { dayKey } from './dayKey'

const KEY = 'hp_attendance_days'

/** YYYY-MM-DD (Asia/Seoul) — dayKey와 동일 */
export function dateKey(d: Date) {
  return dayKey(d)
}

export async function loadAttendanceKeys(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export async function saveAttendanceKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(keys))
  } catch {
    // ignore
  }
}

/** 오늘 출석 찍기. 이미 찍었으면 null */
export async function stampToday(today = new Date()): Promise<string[] | null> {
  const key = dateKey(today)
  const prev = await loadAttendanceKeys()
  if (prev.includes(key)) return null
  const next = [...prev, key]
  await saveAttendanceKeys(next)
  return next
}

export const ATTENDANCE_ENERGY_REWARD = 2
