import { Colors } from './Colors'
import type { DiaryMoodId } from './Moods'

export type DiaryEntry = {
  id: string
  year: number
  month: number
  day: number
  weekday: string
  /** `YYYY-MM-DD HH:mm:ss` (Asia/Seoul) — 하루 여러 건 구분 */
  createdAt: string
  moodId: DiaryMoodId
  preview: string
  body: string
  tags: string[]
}

function at(
  y: number,
  m: number,
  d: number,
  h: number,
  mi: number,
  s: number,
) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${y}-${p(m)}-${p(d)} ${p(h)}:${p(mi)}:${p(s)}`
}

/** 데모 기록 — 같은 날 여러 건 가능 */
export const DIARY_DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    year: 2026,
    month: 7,
    day: 1,
    weekday: '수요일',
    createdAt: at(2026, 7, 1, 21, 12, 5),
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
    createdAt: at(2026, 7, 2, 19, 40, 18),
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
    createdAt: at(2026, 7, 3, 23, 5, 42),
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
    createdAt: at(2026, 7, 4, 15, 22, 9),
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
    createdAt: at(2026, 7, 6, 22, 48, 31),
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
    createdAt: at(2026, 7, 7, 12, 15, 3),
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
    createdAt: at(2026, 7, 8, 9, 5, 12),
    moodId: 'ok',
    preview: '일이 너무 많아 하루 종일 긴장한 채로 보냈다.',
    body: '일이 너무 많아 하루 종일 긴장한 채로 보냈다. 저녁이 되어서야 겨우 숨을 돌렸어요. 그래도 오늘 하루를 버텨낸 나를 조금은 칭찬해 주고 싶어요.',
    tags: ['업무'],
  },
  {
    id: '7b',
    year: 2026,
    month: 7,
    day: 8,
    weekday: '수요일',
    createdAt: at(2026, 7, 8, 21, 33, 47),
    moodId: 'good',
    preview: '밤이 되니 조금은 마음이 가라앉았어요.',
    body: '밤이 되니 조금은 마음이 가라앉았어요. 낮에 쌓였던 긴장이 풀리는 느낌이에요.',
    tags: ['휴식'],
  },
  {
    id: '8',
    year: 2026,
    month: 7,
    day: 9,
    weekday: '목요일',
    createdAt: at(2026, 7, 9, 18, 2, 55),
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
    createdAt: at(2026, 7, 11, 16, 44, 20),
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
    createdAt: at(2026, 7, 12, 20, 11, 8),
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
    createdAt: at(2026, 7, 14, 14, 27, 36),
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
    createdAt: at(2026, 7, 15, 19, 55, 14),
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
    createdAt: at(2026, 7, 17, 22, 8, 41),
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
    createdAt: at(2026, 7, 18, 10, 18, 2),
    moodId: 'good',
    preview: '혼자만의 시간이 그리워 조금 외로웠어요.',
    body: '혼자만의 시간이 그리워 조금 외로웠어요. 일기를 쓰니 마음이 조금 정리되는 느낌이에요.',
    tags: ['감정'],
  },
  {
    id: '14b',
    year: 2026,
    month: 7,
    day: 18,
    weekday: '토요일',
    createdAt: at(2026, 7, 18, 15, 42, 19),
    moodId: 'great',
    preview: '오후에 잠깐 햇살을 쬐니 기분이 나아졌어요.',
    body: '오후에 잠깐 햇살을 쬐니 기분이 나아졌어요. 작은 산책이 큰 도움이 되더라고요.',
    tags: ['운동'],
  },
  {
    id: '14c',
    year: 2026,
    month: 7,
    day: 18,
    weekday: '토요일',
    createdAt: at(2026, 7, 18, 23, 6, 55),
    moodId: 'ok',
    preview: '하루를 마감하며 다시 한 번 마음을 적어요.',
    body: '하루를 마감하며 다시 한 번 마음을 적어요. 같은 날이어도 시간마다 느낌이 다르네요.',
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

/** 해당 날짜의 최신 기록 1건 (없으면 undefined) */
export function findDiaryEntryByDate(
  year: number,
  month: number,
  day: number,
) {
  const list = DIARY_DEMO_ENTRIES.filter(
    (e) => e.year === year && e.month === month && e.day === day,
  ).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return list[0]
}

/** 캘린더용 — 날짜당 가장 최근 감정 + 기록 건수 */
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
  const counts = new Map<number, number>()
  for (const e of DIARY_DEMO_ENTRIES) {
    if (e.year !== year || e.month !== month) continue
    const t = new Date(e.year, e.month - 1, e.day).getTime()
    if (t > todayStart) continue
    counts.set(e.day, (counts.get(e.day) ?? 0) + 1)
    const prev = latest.get(e.day)
    if (!prev || e.createdAt > prev.createdAt) latest.set(e.day, e)
  }
  return [...latest.entries()].map(([day, e]) => ({
    day,
    moodId: e.moodId,
    count: counts.get(day) ?? 1,
  }))
}
