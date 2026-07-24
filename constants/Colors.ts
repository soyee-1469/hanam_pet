/**
 * Hanam Healing Pet Color System v3.2
 * 시안 변수표 기준 — 브라운·크림 베이스, 코랄은 CTA 버튼만
 *
 * 옵션 선택 = cocoa / selected(=cocoa)
 * CTA 활성 = primary 코랄
 * CTA 비활성 = inactive + inactiveText
 * 에너지 = accent 옐로
 */

export const Colors = {
  // —— Core brown / cream ——
  /** 제목·본문·옵션 선택 */
  cocoa: '#7A5B45',
  textPrimary: '#7A5B45',
  textSecondary: '#8E6F5C',
  textDisabled: '#B79A8A',

  /**
   * 칩·필터·옵션 선택 상태 (= cocoa)
   * 코랄(primary) 사용 금지
   */
  selected: '#7A5B45',
  /** @deprecated Colors.selected 사용 */
  chipSelected: '#7A5B45',

  creamyBeige: '#F6EFE5',
  background: '#F8F4EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5EDE6',
  peach: '#FFD0C6',
  sand: '#E9DCCF',
  beige: '#D9C7BA',

  // —— Accent yellow ——
  accent: '#FFD78A',
  accentSoft: '#FBECC4',

  // —— CTA coral (버튼만) ——
  primary: '#FF8F7A',
  primaryPressed: '#F07864',
  primaryLight: '#FFD0C6',
  secondary: '#FF8F7A',
  secondaryPressed: '#F07864',
  secondaryLight: '#FCE8C0',

  // —— Neutral ——
  taupe: '#B79A8A',
  sage: '#A9B69A',
  sageSoft: '#E8EEE4',

  // Border / Divider / option unselected
  border: '#E9DCCF',
  /** 옵션 미선택 면·테두리 (= border) */
  unselected: '#E9DCCF',
  divider: '#F1E9E0',

  // Inactive (CTA 비활성)
  inactive: '#ECECEB',
  inactiveText: '#B8B8B8',

  // Status
  success: '#A9B69A',
  warning: '#C41000',
  error: '#C4847E',
  errorSoft: '#FFF0EE',

  // Emotion diary
  moodGood: '#FF8F7A',
  moodOk: '#D4E08A',
  moodHard: '#8EC5E8',

  // Buttons
  buttonPrimaryBg: '#FF8F7A',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FFFFFF',
  buttonSecondaryText: '#7A5B45',
  buttonDisabledBg: '#ECECEB',
  buttonDisabledText: '#B8B8B8',

  // Energy — Accent 옐로
  energyFill: '#FFD78A',
  energyFillMid: '#FFD78A',
  energyTrack: '#E9DCCF',

  // Soft recessed card
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
    shadowColor: Colors.cocoa,
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
    tint: Colors.cocoa,
    tabIconDefault: Colors.textDisabled,
    tabIconSelected: Colors.cocoa,
  },
  dark: {
    text: Colors.surface,
    background: Colors.cocoa,
    tint: Colors.primary,
    tabIconDefault: Colors.textDisabled,
    tabIconSelected: Colors.primary,
  },
}

export default ThemeColors
