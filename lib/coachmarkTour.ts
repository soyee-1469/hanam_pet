/** 코치마크 투어 스텝 (cm-01 환영 시트 이후) */

export type PetTourHighlight =
  | 'care'
  | 'composer'
  | 'writeCta'
  | 'checkTool'
  | 'menu'
  | 'none'

export type PetTourRoute = 'pet' | 'chat' | 'diary' | 'mind'

export type PetTourStep = {
  id: string
  badge: string
  title: (petName: string) => string
  body: (petName: string) => string
  highlight: PetTourHighlight
  route: PetTourRoute
  /** 기본 down — 하이라이트가 카드 위일 때 up */
  tail?: 'up' | 'down'
}

/** 시안 기준 총 장수 */
export const PET_TOUR_TOTAL = 6

export const PET_TOUR_STEPS: PetTourStep[] = [
  {
    id: 'cm-02',
    badge: '나의 펫',
    title: () => '나만의 펫을 돌봐 주세요',
    body: (name) =>
      `사료를 주고 놀아 주면 무럭무럭 자라요. ${name}를 돌보며 내 마음도 함께 챙겨요.`,
    highlight: 'care',
    route: 'pet',
  },
  {
    id: 'cm-02b',
    badge: '나의 펫',
    title: () => '펫에게 선물하세요',
    body: () =>
      '위에서 사료와 장난감을 받을 수 있어요. 받은 선물은 아래에서 펫에게 줄 수 있어요.',
    highlight: 'menu',
    route: 'pet',
    tail: 'up',
  },
  {
    id: 'cm-03',
    badge: '대화',
    title: () => '펫과 마음을 나눠요',
    body: () =>
      '여기에 오늘의 마음을 적어 보내면, 내 마음에 공감하며 따뜻하게 답해 줘요.',
    highlight: 'composer',
    route: 'chat',
  },
  {
    id: 'cm-04',
    badge: '마음일기',
    title: () => '오늘의 마음을 남겨요',
    body: () =>
      '하루에 한 번, 오늘의 감정을 되돌아 보고 간단히 기록해요.',
    highlight: 'writeCta',
    route: 'diary',
  },
  {
    id: 'cm-05',
    badge: '마음챙김',
    title: () => '내 마음을 살펴봐요',
    body: () =>
      '간단한 자가진단으로 지금 내 마음 상태를 객관적으로 확인할 수 있어요.',
    highlight: 'checkTool',
    route: 'mind',
    tail: 'up',
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

/** 탭 바 하이라이트용 — Tabs.Screen name */
export function petTourTabRouteName(
  stepIndex: number | null,
): 'chat' | 'diary' | 'index' | 'mind' | null {
  if (stepIndex == null) return null
  const route = PET_TOUR_STEPS[stepIndex]?.route
  if (route === 'pet') return 'index'
  if (route === 'chat' || route === 'diary' || route === 'mind') return route
  return null
}
