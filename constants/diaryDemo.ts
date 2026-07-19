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

/** 데모 기록 — 달력에 감정별 마커가 다양하게 보이도록 분산 */
export const DIARY_DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    year: 2026,
    month: 7,
    day: 1,
    weekday: '수요일',
    moodId: 'hard',
    preview: '몸도 마음도 조금 불편한 하루였어요.',
    body: '몸도 마음도 조금 불편한 하루였어요. 무리하지 않고 쉬어 가기로 했어요.',
    tags: ['건강', '휴식'],
  },
  {
    id: '2',
    year: 2026,
    month: 7,
    day: 2,
    weekday: '목요일',
    moodId: 'great',
    preview: '가벼운 산책 후 마음이 한결 풀렸어요.',
    body: '가벼운 산책 후 마음이 한결 풀렸어요. 바람과 햇살이 좋았고, 그 순간을 남겨 두고 싶었어요.',
    tags: ['운동', '취미'],
  },
  {
    id: '3',
    year: 2026,
    month: 7,
    day: 3,
    weekday: '금요일',
    moodId: 'bad',
    preview: '잠 못 드는 밤에 조용히 마음을 들여다봤다.',
    body: '잠 못 드는 밤에 조용히 마음을 들여다봤다. 걱정이 꼬리를 물었지만, 하나씩 적어 보니 내일 할 수 있는 작은 일들도 보이기 시작했어요.',
    tags: ['수면'],
  },
  {
    id: '4',
    year: 2026,
    month: 7,
    day: 4,
    weekday: '토요일',
    moodId: 'ok',
    preview: '작은 일에 화가 났다가 곧 가라앉았어요.',
    body: '작은 일에 화가 났다가 곧 가라앉았어요. 깊게 숨을 쉬고 나니 조금은 괜찮았어요.',
    tags: ['감정'],
  },
  {
    id: '5',
    year: 2026,
    month: 7,
    day: 6,
    weekday: '월요일',
    moodId: 'good',
    preview: '생각이 많아 늦게까지 잠들지 못했다.',
    body: '생각이 많아 늦게까지 잠들지 못했다. 관계에서 온 말들이 자꾸 맴돌아서 마음을 가라앉히기가 쉽지 않았어요. 그래도 이렇게 적어 보니 조금은 가벼워진 것 같아요.',
    tags: ['관계', '수면'],
  },
  {
    id: '6',
    year: 2026,
    month: 7,
    day: 7,
    weekday: '화요일',
    moodId: 'great',
    preview: '좋아하는 음악을 들으며 기분이 좋아졌어요.',
    body: '좋아하는 음악을 들으며 기분이 좋아졌어요. 잠깐의 여유만으로도 하루가 달라지더라고요.',
    tags: ['취미'],
  },
  {
    id: '7',
    year: 2026,
    month: 7,
    day: 8,
    weekday: '수요일',
    moodId: 'ok',
    preview: '일이 너무 많아 하루 종일 긴장한 채로 보냈다.',
    body: '일이 너무 많아 하루 종일 긴장한 채로 보냈다. 저녁이 되어서야 겨우 숨을 돌렸어요. 그래도 오늘 하루를 버텨낸 나를 조금은 칭찬해 주고 싶어요.',
    tags: ['업무'],
  },
  {
    id: '8',
    year: 2026,
    month: 7,
    day: 9,
    weekday: '목요일',
    moodId: 'hard',
    preview: '컨디션이 안 좋아 조용히 하루를 보냈어요.',
    body: '컨디션이 안 좋아 조용히 하루를 보냈어요. 오늘은 쉬어도 괜찮다고 스스로에게 말해 줬어요.',
    tags: ['건강'],
  },
  {
    id: '9',
    year: 2026,
    month: 7,
    day: 11,
    weekday: '토요일',
    moodId: 'good',
    preview: '비 오는 날이라 괜히 마음이 가라앉았어요.',
    body: '비 오는 날이라 괜히 마음이 가라앉았어요. 따뜻한 차를 마시며 천천히 가라앉히기로 했어요.',
    tags: ['날씨'],
  },
  {
    id: '10',
    year: 2026,
    month: 7,
    day: 12,
    weekday: '일요일',
    moodId: 'bad',
    preview: '내일 일이 걱정되어 마음이 복잡했어요.',
    body: '내일 일이 걱정되어 마음이 복잡했어요. 할 일을 적어 보니 조금은 정리가 됐어요.',
    tags: ['업무', '걱정'],
  },
  {
    id: '11',
    year: 2026,
    month: 7,
    day: 14,
    weekday: '화요일',
    moodId: 'great',
    preview: '친구와 웃으며 이야기한 하루였어요.',
    body: '친구와 웃으며 이야기한 하루였어요. 함께 있으면 마음이 한결 편해지는 것 같아요.',
    tags: ['관계'],
  },
  {
    id: '12',
    year: 2026,
    month: 7,
    day: 15,
    weekday: '수요일',
    moodId: 'ok',
    preview: '교통 체증에 짜증이 났지만 금세 풀렸어요.',
    body: '교통 체증에 짜증이 났지만 금세 풀렸어요. 집에 와서 스트레칭을 하니 몸이 풀렸어요.',
    tags: ['일상'],
  },
  {
    id: '13',
    year: 2026,
    month: 7,
    day: 17,
    weekday: '금요일',
    moodId: 'hard',
    preview: '어깨가 뭉치고 기운이 없었어요.',
    body: '어깨가 뭉치고 기운이 없었어요. 일찍 자고 내일은 가볍게 움직여 보려 해요.',
    tags: ['건강', '휴식'],
  },
  {
    id: '14',
    year: 2026,
    month: 7,
    day: 18,
    weekday: '토요일',
    moodId: 'good',
    preview: '혼자만의 시간이 그리워 조금 외로웠어요.',
    body: '혼자만의 시간이 그리워 조금 외로웠어요. 일기를 쓰니 마음이 조금 정리되는 느낌이에요.',
    tags: ['감정'],
  },
]

/** 목록·상세·레전드 감정 라벨 색 (Inside Out) */
export const DIARY_MOOD_LABEL_COLOR: Record<DiaryMoodId, string> = {
  great: Colors.accent, // 기뻐요 · Joy yellow
  good: '#6BA3D1', // 슬퍼요 · Sadness blue
  ok: '#D96B5E', // 화가나요 · Anger red
  bad: '#9B7EBF', // 걱정돼요 · Fear purple
  hard: '#8FA86A', // 불편해요 · Disgust green
}

/** 분포 막대 면색 — 라벨과 동일 (단일 소스) */
export const DIARY_MOOD_BAR_COLOR = DIARY_MOOD_LABEL_COLOR

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
