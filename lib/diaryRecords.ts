import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  DIARY_DEMO_ENTRIES,
  type DiaryEntry,
} from '../constants/diaryDemo'
import type { DiaryMoodId } from '../constants/Moods'

const KEY = 'hp_diary_cleared_v1'

type Listener = () => void

let cleared = false
let hydrated = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeDiaryRecords(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function hydrateDiaryRecords(): Promise<void> {
  if (hydrated) return
  try {
    cleared = (await AsyncStorage.getItem(KEY)) === '1'
  } catch {
    cleared = false
  }
  hydrated = true
  emit()
}

export async function clearDiaryRecords(): Promise<void> {
  cleared = true
  hydrated = true
  try {
    await AsyncStorage.setItem(KEY, '1')
  } catch {
    // ignore
  }
  emit()
}

export function isDiaryCleared(): boolean {
  return cleared
}

export function listDiaryEntries(): DiaryEntry[] {
  return cleared ? [] : DIARY_DEMO_ENTRIES
}

export function findDiaryEntry(id: string) {
  return listDiaryEntries().find((e) => e.id === id)
}

export function findDiaryEntryByDate(
  year: number,
  month: number,
  day: number,
) {
  return listDiaryEntries().find(
    (e) => e.year === year && e.month === month && e.day === day,
  )
}

/** 캘린더용 — 활성 기록이 있는 날만 감정 표시 */
export function diaryMoodsForMonth(
  year: number,
  month: number,
  today: Date,
) {
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime()
  const map = new Map<number, DiaryMoodId>()
  for (const e of listDiaryEntries()) {
    if (e.year !== year || e.month !== month) continue
    const t = new Date(e.year, e.month - 1, e.day).getTime()
    if (t > todayStart) continue
    if (!map.has(e.day)) map.set(e.day, e.moodId)
  }
  return [...map.entries()].map(([day, moodId]) => ({ day, moodId }))
}
