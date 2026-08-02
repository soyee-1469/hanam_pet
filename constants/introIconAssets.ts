/**
 * 온보딩·앱 소개용 아이콘 SVG 경로 정리.
 * Phosphor regular에서 가져와 `assets/images/SVG/`에 보관.
 * (시안/에셋 핸드오프용 — 런타임은 phosphor-react-native 사용)
 */

export const FeatureIconSvgPath = {
  /** 펫과 대화할 수 있어요 — ChatCircle */
  chat: 'assets/images/SVG/features/feature-chat.svg',
  /** 마음을 기록할 수 있어요 — CalendarHeart */
  diary: 'assets/images/SVG/features/feature-diary.svg',
  /** 마음 상태를 살필 수 있어요 — MagnifyingGlass */
  mindCheck: 'assets/images/SVG/features/feature-mind-check.svg',
  /** 힐링 영상을 볼 수 있어요 — PlayCircle */
  healing: 'assets/images/SVG/features/feature-healing.svg',
  /** 나만의 펫 키우기 — PawPrint */
  pet: 'assets/images/SVG/features/feature-pet.svg',
  heart: 'assets/images/SVG/features/feature-heart.svg',
  notebook: 'assets/images/SVG/features/feature-notebook.svg',
} as const

/** 소개 3장 추천 세트 */
export const IntroFeatureTrio = [
  {
    key: 'chat',
    label: '펫과 대화할 수 있어요',
    path: FeatureIconSvgPath.chat,
  },
  {
    key: 'diary',
    label: '마음을 기록할 수 있어요',
    path: FeatureIconSvgPath.diary,
  },
  {
    key: 'mindCheck',
    label: '마음 상태를 살필 수 있어요',
    path: FeatureIconSvgPath.mindCheck,
  },
] as const
