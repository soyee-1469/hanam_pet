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

function sortByCreatedAtDesc(a: DiaryEntry, b: DiaryEntry) {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
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
  return cleared ? [] : [...DIARY_DEMO_ENTRIES].sort(sortByCreatedAtDesc)
}

export function findDiaryEntry(id: string) {
  return listDiaryEntries().find((e) => e.id === id)
}

/** 해당 날짜의 최신 기록 1건 */
export function findDiaryEntryByDate(
  year: number,
  month: number,
  day: number,
) {
  return listDiaryEntriesByDate(year, month, day)[0]
}

/** 해당 날짜 기록 전부 (최신순) */
export function listDiaryEntriesByDate(
  year: number,
  month: number,
  day: number,
): DiaryEntry[] {
  return listDiaryEntries()
    .filter((e) => e.year === year && e.month === month && e.day === day)
    .sort(sortByCreatedAtDesc)
}

/** 해당 월 기록 전부 (최신순) */
export function listDiaryEntriesByMonth(
  year: number,
  month: number,
): DiaryEntry[] {
  return listDiaryEntries()
    .filter((e) => e.year === year && e.month === month)
    .sort(sortByCreatedAtDesc)
}

export function countDiaryEntriesByDate(
  year: number,
  month: number,
  day: number,
) {
  return listDiaryEntriesByDate(year, month, day).length
}

/** 캘린더용 — 날짜당 가장 최근 감정 */
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
  const latest = new Map<number, DiaryEntry>()
  for (const e of listDiaryEntries()) {
    if (e.year !== year || e.month !== month) continue
    const t = new Date(e.year, e.month - 1, e.day).getTime()
    if (t > todayStart) continue
    const prev = latest.get(e.day)
    if (!prev || e.createdAt > prev.createdAt) latest.set(e.day, e)
  }
  return [...latest.entries()].map(([day, e]) => ({
    day,
    moodId: e.moodId as DiaryMoodId,
  }))
}
