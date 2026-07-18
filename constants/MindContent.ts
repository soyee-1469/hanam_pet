/** 마음챙김 콘텐츠 더미 데이터 */

export type MindMoodFilter = 'all' | '우울' | '불안' | '스트레스'

export type MindContent = {
  id: string
  title: string
  mood: Exclude<MindMoodFilter, 'all'>
  minutes: number
  icon: 'moon' | 'sun' | 'heart' | 'sparkle'
  summary: string
  /** 외부 콘텐츠 URL (있으면 재생 시 외부 링크 확인) */
  externalUrl?: string
}

export const MIND_FEATURED: MindContent = {
  id: 'featured-sleep',
  title: '잠들기 전 5분',
  mood: '불안',
  minutes: 12,
  icon: 'moon',
  summary: '잠들기 전 짧게 몸을 풀고 호흡을 고르는 가이드입니다.',
  externalUrl: 'https://example.com/content/healing-sleep-5min',
}

export const MIND_CONTENTS: MindContent[] = [
  {
    id: 'self-talk',
    title: '독이 되는 혼잣말과 약이 되는 혼잣말',
    mood: '스트레스',
    minutes: 15,
    icon: 'moon',
    summary: '나를 힘들게 하는 혼잣말을 알아차리고, 부드러운 말로 바꿔 보는 시간입니다.',
    externalUrl: 'https://example.com/content/healing-self-talk',
  },
  {
    id: 'how-was-today',
    title: '오늘 하루 어떠셨나요? 지친 당신을 위해',
    mood: '우울',
    minutes: 8,
    icon: 'sun',
    summary: '하루를 돌아보며 지친 마음에 잠시 쉬어가는 안내입니다.',
    externalUrl: 'https://example.com/content/healing-how-was-today',
  },
  {
    id: 'breathing',
    title: '불안을 가라앉히는 호흡법을 알아보자!',
    mood: '불안',
    minutes: 6,
    icon: 'heart',
    summary: '간단하고 따라 하기 쉬운 호흡으로 불안을 천천히 가라앉혀 봅니다.',
    externalUrl: 'https://example.com/content/healing-breathing',
  },
  {
    id: 'gratitude',
    title: '하루를 정리하는 감사 일기',
    mood: '우울',
    minutes: 10,
    icon: 'sparkle',
    summary: '작은 감사 거리를 찾아 하루를 부드럽게 마무리하는 연습입니다.',
    externalUrl: 'https://example.com/content/healing-gratitude',
  },
]

export type MindCheckItem = {
  id: 'phq' | 'gad' | 'stress'
  /** 목록 짧은 제목 */
  title: string
  /** NDS / NAS / NSS */
  code: string
  questions: number
  minutes: number
  icon: 'moon' | 'heart' | 'lightning'
}

export const MIND_CHECKS: MindCheckItem[] = [
  {
    id: 'phq',
    title: '우울 평가도구',
    code: 'NDS',
    questions: 12,
    minutes: 5,
    icon: 'moon',
  },
  {
    id: 'gad',
    title: '불안 평가도구',
    code: 'NAS',
    questions: 11,
    minutes: 4,
    icon: 'heart',
  },
  {
    id: 'stress',
    title: '스트레스 평가도구',
    code: 'NSS',
    questions: 11,
    minutes: 4,
    icon: 'lightning',
  },
]

export function getMindContent(id: string | undefined): MindContent | null {
  if (!id) return null
  if (id === MIND_FEATURED.id) return MIND_FEATURED
  return MIND_CONTENTS.find((c) => c.id === id) ?? null
}

export function getMindCheck(id: string | undefined): MindCheckItem | null {
  if (!id) return null
  return MIND_CHECKS.find((c) => c.id === id) ?? null
}
