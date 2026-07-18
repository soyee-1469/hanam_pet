import { Colors } from './Colors'

export type MoodTone = 'good' | 'ok' | 'hard'
export type DiaryMoodId = 'great' | 'good' | 'ok' | 'bad' | 'hard'

/**
 * 감정 순서 = emoji_1 ~ emoji_5 (밝음 → 힘듦)
 * 1 기쁨 · 2 좋음 · 3 보통 · 4 걱정 · 5 슬픔(눈물)
 */
export const DIARY_MOODS: {
  id: DiaryMoodId
  label: string
  /** 분포 레전드용 짧은 이름 */
  shortLabel: string
  tone: MoodTone
  emojiIndex: 1 | 2 | 3 | 4 | 5
  softBg: string
}[] = [
  { id: 'great', label: '기뻐요', shortLabel: '기쁨', tone: 'good', emojiIndex: 1, softBg: '#FCE8DC' },
  { id: 'good', label: '좋아요', shortLabel: '좋음', tone: 'good', emojiIndex: 2, softBg: '#FCE8DC' },
  { id: 'ok', label: '그저그래요', shortLabel: '보통', tone: 'ok', emojiIndex: 3, softBg: '#F0E8E2' },
  { id: 'bad', label: '걱정돼요', shortLabel: '걱정', tone: 'hard', emojiIndex: 4, softBg: '#F5E6EA' },
  { id: 'hard', label: '슬퍼요', shortLabel: '슬픔', tone: 'hard', emojiIndex: 5, softBg: '#E4EEF5' },
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
  return 5
}

export const MOOD_TONES = {
  good: Colors.moodGood,
  ok: Colors.moodOk,
  hard: Colors.moodHard,
} as const
