import { Colors } from './Colors'

export type MoodTone = 'good' | 'ok' | 'hard'
export type DiaryMoodId = 'great' | 'good' | 'ok' | 'bad' | 'hard'

/** 감정 순서: emoji_1 ~ emoji_5 */
export const DIARY_MOODS: {
  id: DiaryMoodId
  label: string
  tone: MoodTone
  emojiIndex: 1 | 2 | 3 | 4 | 5
  softBg: string
}[] = [
  { id: 'great', label: '최고야', tone: 'good', emojiIndex: 1, softBg: '#FCE8DC' },
  { id: 'good', label: '좋아', tone: 'good', emojiIndex: 2, softBg: '#E8F0E0' },
  { id: 'ok', label: '그저그래', tone: 'ok', emojiIndex: 3, softBg: '#F0E8E2' },
  { id: 'bad', label: '좋지않아', tone: 'hard', emojiIndex: 4, softBg: '#F5E6EA' },
  { id: 'hard', label: '힘들어', tone: 'hard', emojiIndex: 5, softBg: '#F8E4E2' },
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
  if (tone === 'good') return 2
  if (tone === 'ok') return 3
  return 5
}

export const MOOD_TONES = {
  good: Colors.moodGood,
  ok: Colors.moodOk,
  hard: Colors.moodHard,
} as const
