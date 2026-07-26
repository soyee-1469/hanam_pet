/** 코치마크 투어 스텝 (cm-01 환영 시트 이후) — 영역별 설명 */

export type PetTourHighlight =
  | 'care'
  | 'composer'
  | 'writeCta'
  | 'checkTool'
  | 'menu'
  | 'tabs'
  | 'none'

export type PetTourRoute = 'pet' | 'chat' | 'diary' | 'mind'

export type PetTourStep = {
  id: string
  badge: string
  title: (petName: string) => string
  body: (petName: string) => string
  highlight: PetTourHighlight
  route: PetTourRoute
  /** 기본 down — 하이라이트가 카드 위일 때 up, 최종 스텝은 none */
  tail?: 'up' | 'down' | 'none'
  /** 기본 「다음」 */
  ctaLabel?: string
}

/** 시안 기준 총 장수 */
export const PET_TOUR_TOTAL = 6

export const PET_TOUR_STEPS: PetTourStep[] = [
  {
    id: 'cm-02',
    badge: '나의 펫',
    title: () => '여기서 펫을 돌봐요',
    body: (name) => `사료·놀아 주기로 ${name}를 챙겨 주세요.`,
    highlight: 'care',
    route: 'pet',
  },
  {
    id: 'cm-02b',
    badge: '나의 펫',
    title: () => '선물은 위에서 받아요',
    body: () => '사료·장난감을 받은 뒤, 아래에서 줄 수 있어요.',
    highlight: 'menu',
    route: 'pet',
    tail: 'up',
  },
  {
    id: 'cm-03',
    badge: '대화',
    title: () => '여기에 마음을 적어요',
    body: () => '보내면 펫이 따뜻하게 답해 줘요.',
    highlight: 'composer',
    route: 'chat',
  },
  {
    id: 'cm-04',
    badge: '마음일기',
    title: () => '오늘의 감정을 남겨요',
    body: () => '이모지와 짧은 글로 하루를 기록해요.',
    highlight: 'writeCta',
    route: 'diary',
  },
  {
    id: 'cm-05',
    badge: '마음챙김',
    title: () => '설문으로 마음을 살피요',
    body: () => '간단한 평가로 상태를 객관적으로 봐요.',
    highlight: 'checkTool',
    route: 'mind',
    tail: 'up',
  },
  {
    id: 'cm-06',
    badge: '시작하기',
    title: () => '아래 메뉴로 다녀보세요',
    body: () => '원하는 기능을 골라 바로 시작해 볼까요?',
    highlight: 'tabs',
    route: 'pet',
    tail: 'none',
    ctaLabel: '시작',
  },
]

export function petTourHref(route: PetTourRoute): string {
  switch (route) {
    case 'chat':
      return '/(tabs)/chat'
    case 'diary':
      return '/(tabs)/diary'
    case 'mind':
      return '/(tabs)/mind?segment=check'
    case 'pet':
    default:
      return '/(tabs)'
  }
}

export type PetTourTabName = 'chat' | 'diary' | 'index' | 'mind'

export type PetTourTabHighlight =
  | { mode: 'single'; route: PetTourTabName }
  | { mode: 'mainMenu' }
  | null

/** 탭 바 하이라이트 */
export function petTourTabHighlight(
  stepIndex: number | null,
): PetTourTabHighlight {
  if (stepIndex == null) return null
  const step = PET_TOUR_STEPS[stepIndex]
  if (!step) return null
  if (step.highlight === 'tabs') return { mode: 'mainMenu' }
  if (step.route === 'pet') return { mode: 'single', route: 'index' }
  if (step.route === 'chat' || step.route === 'diary' || step.route === 'mind') {
    return { mode: 'single', route: step.route }
  }
  return null
}

/** @deprecated use petTourTabHighlight */
export function petTourTabRouteName(
  stepIndex: number | null,
): PetTourTabName | null {
  const h = petTourTabHighlight(stepIndex)
  return h?.mode === 'single' ? h.route : null
}
