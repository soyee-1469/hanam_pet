/**
 * 온보딩·앱 소개 스크린샷 5장용 아이콘 SVG 경로.
 * Phosphor regular → `assets/images/SVG/features/`
 */

export const FeatureIconSvgPath = {
  /** 1. 펫과 대화해요 */
  chat: 'assets/images/SVG/features/feature-chat.svg',
  /** 2. 마음을 기록해요 */
  diary: 'assets/images/SVG/features/feature-diary.svg',
  /** 3. 마음 상태를 살펴요 */
  mindCheck: 'assets/images/SVG/features/feature-mind-check.svg',
  /** 4. 힐링 영상을 봐요 */
  healing: 'assets/images/SVG/features/feature-healing.svg',
  /** 5. 나의 펫을 키워요 */
  pet: 'assets/images/SVG/features/feature-pet.svg',
  heart: 'assets/images/SVG/features/feature-heart.svg',
  notebook: 'assets/images/SVG/features/feature-notebook.svg',
} as const

/** 스크린샷 소개 5장 */
export const IntroFeatureScreens = [
  {
    key: 'chat',
    title: '펫과 대화해요',
    body: '오늘 있었던 일을 편하게 말하고, 공감·위로를 받아요.',
    path: FeatureIconSvgPath.chat,
    route: '/onboarding/pet-chat',
  },
  {
    key: 'diary',
    title: '마음을 기록해요',
    body: '하루 감정을 남기고, 쌓인 기록으로 흐름을 돌아봐요.',
    path: FeatureIconSvgPath.diary,
    route: '/onboarding/diary-record',
  },
  {
    key: 'mindCheck',
    title: '마음 상태를 살펴요',
    body: '짧은 문항으로 지금 상태를 확인하고, 필요할 때 도움을 연결해요.',
    path: FeatureIconSvgPath.mindCheck,
    route: '/onboarding/mind-check',
  },
  {
    key: 'healing',
    title: '힐링 영상을 봐요',
    body: '다양한 힐링 영상으로 마음을 다독여 보세요.',
    path: FeatureIconSvgPath.healing,
    route: '/onboarding/healing-content',
  },
  {
    key: 'pet',
    title: '나의 펫을 키워요',
    body: '5마리 중 나의 펫을 고르고, 언제든지 바꿀 수 있어요. 사료와 장난감을 주며 키울 수 있어요.',
    path: FeatureIconSvgPath.pet,
    route: '/onboarding/pet-care',
  },
] as const

/** @deprecated IntroFeatureScreens 사용 */
export const IntroFeatureTrio = IntroFeatureScreens
