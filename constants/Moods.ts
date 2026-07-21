import { Colors } from './Colors'

export type MoodTone = 'good' | 'ok' | 'hard'
export type DiaryMoodId = 'great' | 'good' | 'ok' | 'bad' | 'hard'

/**
 * 감정 5종 (피그마 마음 기록)
 * 1 기뻐요 · 2 슬퍼요 · 3 화가나요 · 4 걱정돼요 · 5 불편해요
 * 에셋: mood-happy / mood-sad / mood-angry / mood-worried / mood-uncomfortable.svg
 */
export const DIARY_MOODS: {
  id: DiaryMoodId
  label: string
  /** 분포 레전드용 — 작성 화면과 동일 표기 */
  shortLabel: string
  tone: MoodTone
  emojiIndex: 1 | 2 | 3 | 4 | 5
  softBg: string
}[] = [
  { id: 'great', label: '기뻐요', shortLabel: '기뻐요', tone: 'good', emojiIndex: 1, softBg: '#FCE8DC' },
  { id: 'good', label: '슬퍼요', shortLabel: '슬퍼요', tone: 'hard', emojiIndex: 2, softBg: '#FCE8DC' },
  { id: 'ok', label: '화가나요', shortLabel: '화가나요', tone: 'ok', emojiIndex: 3, softBg: '#FCE8DC' },
  { id: 'bad', label: '걱정돼요', shortLabel: '걱정돼요', tone: 'hard', emojiIndex: 4, softBg: '#FCE8DC' },
  { id: 'hard', label: '불편해요', shortLabel: '불편해요', tone: 'ok', emojiIndex: 5, softBg: '#FCE8DC' },
]

export const CHAT_EMOTION_CARDS: {
  id: string
  label: string
  emojiIndex: 1 | 2 | 3 | 4 | 5
  softBg: string
}[] = [
  { id: 'talk', label: '그냥 이야기할래', emojiIndex: 2, softBg: '#FCE8DC' },
  { id: 'complex', label: '마음이 복잡해', emojiIndex: 4, softBg: '#F5E6EA' },
  { id: 'sleep', label: '잠이 안 와', emojiIndex: 3, softBg: '#F0E8E2' },
  { id: 'good', label: '기분이 좋아', emojiIndex: 1, softBg: '#E8F0E0' },
]

export function emojiIndexForTone(tone: MoodTone): 1 | 2 | 3 | 4 | 5 {
  if (tone === 'good') return 1
  if (tone === 'ok') return 3
  return 2
}

export const MOOD_TONES = {
  good: Colors.moodGood,
  ok: Colors.moodOk,
  hard: Colors.moodHard,
} as const
