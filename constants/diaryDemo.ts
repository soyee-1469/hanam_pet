import { Colors } from './Colors'
import type { DiaryMoodId } from './Moods'

export type DiaryEntry = {
  id: string
  year: number
  month: number
  day: number
  weekday: string
  moodId: DiaryMoodId
  preview: string
  body: string
  tags: string[]
}

/** 데모 기록 — 실제 저장 연동 전 */
export const DIARY_DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    year: 2026,
    month: 7,
    day: 8,
    weekday: '일요일',
    moodId: 'ok',
    preview: '일이 너무 많아서 하루 종일 긴장하며 보냈어요.',
    body: '일이 너무 많아서 하루 종일 긴장하며 보냈어요. 저녁이 되어서야 겨우 숨을 돌렸어요. 그래도 오늘 하루를 버텨낸 나를 조금은 칭찬해 주고 싶어요.',
    tags: ['업무'],
  },
  {
    id: '2',
    year: 2026,
    month: 7,
    day: 6,
    weekday: '금요일',
    moodId: 'hard',
    preview: '생각이 많아 늦게까지 잠들지 못했어요.',
    body: '생각이 많아 늦게까지 잠들지 못했어요. 관계에서 온 말들이 자꾸 맴돌아서 마음을 가라앉히기가 쉽지 않았어요. 그래도 이렇게 적어 보니 조금은 가벼워진 것 같아요.',
    tags: ['관계', '수면'],
  },
  {
    id: '3',
    year: 2026,
    month: 7,
    day: 3,
    weekday: '화요일',
    moodId: 'bad',
    preview: '잠 못 드는 밤에 조용히 마음을 들여다봤어요.',
    body: '잠 못 드는 밤에 조용히 마음을 들여다봤어요. 걱정이 꼬리를 물었지만, 하나씩 적어 보니 내일 할 수 있는 작은 일들도 보이기 시작했어요.',
    tags: ['수면'],
  },
  {
    id: '4',
    year: 2026,
    month: 5,
    day: 30,
    weekday: '금요일',
    moodId: 'great',
    preview: '한 주를 돌아보며 생각을 정리했어요.',
    body: '한 주를 돌아보며 생각을 정리했어요. 작은 기쁨들이 생각보다 많았고, 그 순간들을 남겨 두니 마음이 따뜻해졌어요.',
    tags: ['휴식'],
  },
  {
    id: '5',
    year: 2026,
    month: 5,
    day: 30,
    weekday: '금요일',
    moodId: 'hard',
    preview: '한 주를 돌아보며 생각을 정리했어요.',
    body: '한 주를 돌아보며 생각을 정리했어요. 불편했던 순간도 있었지만, 그걸 알아차린 것만으로도 나에게 의미가 있었어요.',
    tags: ['휴식'],
  },
]

export const DIARY_MOOD_LABEL_COLOR: Record<DiaryMoodId, string> = {
  great: Colors.primary,
  good: Colors.moodGood,
  ok: Colors.moodOk,
  bad: '#9B7EBF',
  hard: Colors.moodHard,
}

export function findDiaryEntry(id: string) {
  return DIARY_DEMO_ENTRIES.find((e) => e.id === id)
}

export function findDiaryEntryByDate(
  year: number,
  month: number,
  day: number,
) {
  return DIARY_DEMO_ENTRIES.find(
    (e) => e.year === year && e.month === month && e.day === day,
  )
}

/** 캘린더용 — 실제 데모 기록이 있는 날만 감정 표시 */
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
  for (const e of DIARY_DEMO_ENTRIES) {
    if (e.year !== year || e.month !== month) continue
    const t = new Date(e.year, e.month - 1, e.day).getTime()
    if (t > todayStart) continue
    if (!map.has(e.day)) map.set(e.day, e.moodId)
  }
  return [...map.entries()].map(([day, moodId]) => ({ day, moodId }))
}
