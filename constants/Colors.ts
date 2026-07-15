/**
 * Hanam Healing Pet Color System v3.0
 * 웜톤 힐링 팔레트 — 채도 낮고 명도 높은 아날로그 감성
 *
 * Main
 * - Warm Coral   #F47B4B (Primary / CTA)
 * - Soft Orange  #F5A23A (Secondary)
 * - Cream Yellow #F4C85B (Accent)
 * - Warm Taupe   #B79A8A (중립)
 * - Warm Ivory   #F8F4EF (Background)
 * - Cocoa Brown  #5B3927 (Text)
 *
 * Sub
 * - Peach #F7C4A3 / Sand #E9DCCF / Beige #D9C7BA / Soft Brown #8E6F5C
 *
 * Primary(코랄/오렌지)는 아래 곳에만
 * 1) Primary 버튼  2) 선택 탭/네비  3) 에너지 진행바  4) 기분 좋음(긍정 감정)
 *
 * 감정 색 의미
 * - 좋음 → 오렌지 계열 (브랜드 메인 포인트 = 긍정)
 * - 보통 → 노란빛 연두
 * - 힘듦 → 스카이 블루 (눈물/하늘 톤)
 */

export const Colors = {
  // Brand
  primary: '#F47B4B',
  primaryPressed: '#E06A3C',
  primaryLight: '#F7C4A3',
  secondary: '#F5A23A',
  secondaryPressed: '#E08E28',
  secondaryLight: '#FCE8C0',
  accent: '#F4C85B',
  accentSoft: '#FBECC4',
  taupe: '#B79A8A',
  sage: '#A9B69A',
  sageSoft: '#E8EEE4',

  // Background / Surface
  background: '#F8F4EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5EDE6',
  creamyBeige: '#F4C85B',
  peach: '#F7C4A3',
  sand: '#E9DCCF',
  beige: '#D9C7BA',

  // Text
  textPrimary: '#5B3927',
  textSecondary: '#8E6F5C',
  textDisabled: '#B79A8A',

  // Border / Divider
  border: '#E9DCCF',
  divider: '#F1E9E0',

  // Status
  success: '#A9B69A',
  warning: '#F5A23A',
  error: '#E57A72',

  // Emotion diary tones — 메인 오렌지 → 노란빛 연두 → 스카이 블루 그라데이션
  moodGood: '#F47B4B',
  moodOk: '#D4E08A',
  moodHard: '#8EC5E8',

  // Buttons
  buttonPrimaryBg: '#F47B4B',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FFF8F2',
  buttonSecondaryText: '#F47B4B',
  buttonDisabledBg: '#E9DCCF',
  buttonDisabledText: '#B79A8A',

  // Energy / Progress
  energyFill: '#F47B4B',
  energyTrack: '#E9DCCF',

  // Soft recessed card (CTA v2)
  cardRecessed: '#FFFBF8',
  cardRecessedHover: '#FFF6EF',
  cardInsetShadow: '#F1E7DC',

  // Icon soft backgrounds
  iconFeed: '#FCE8DC',
  iconToy: '#FCE8C0',
  iconAttendance: '#EFE6DC',
  iconReward: '#FBECC4',
  iconHeart: '#FCE8DC',
} as const

export type ColorToken = keyof typeof Colors

/** Shadow System */
export const Shadows = {
  elevation: {
    shadowColor: '#5B3927',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
} as const

/** Expo 템플릿 호환 */
const ThemeColors = {
  light: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.textDisabled,
    tabIconSelected: Colors.primary,
  },
  dark: {
    text: Colors.surface,
    background: Colors.textPrimary,
    tint: Colors.primary,
    tabIconDefault: Colors.textDisabled,
    tabIconSelected: Colors.primary,
  },
}

export default ThemeColors
