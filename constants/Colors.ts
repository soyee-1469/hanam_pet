/**
 * Hanam Healing Pet Color System v2.0
 * 컨셉 2 — 반려동물과의 다정한 동화
 *
 * 컨셉보드 추출 원색
 * - 코랄 오렌지 #FA6F37 (주조)
 * - 웜 옐로우   #FBAE38 (보조)
 * - 밀크 코코아 #BB7E3F (강조)
 * - 크리미 베이지 #FDDEAC (배경 계열)
 *
 * Primary(코랄)는 아래 3곳에만
 * 1) Primary 버튼  2) 선택 탭/네비  3) 에너지 진행바
 */

export const Colors = {
  // Brand — 컨셉보드
  primary: '#FA6F37',
  primaryPressed: '#E85F2A',
  primaryLight: '#FFE4D6',
  secondary: '#FBAE38',
  secondaryPressed: '#E89A28',
  secondaryLight: '#FFF0D4',
  accent: '#BB7E3F',
  accentSoft: '#F3E4D0',
  sage: '#A9B69A',
  sageSoft: '#E8EEE4',

  // Background / Surface
  background: '#FFF9F3',
  surface: '#FFFFFF',
  surfaceSecondary: '#FFF3E6',
  creamyBeige: '#FDDEAC',

  // Text
  textPrimary: '#5C3D2E',
  textSecondary: '#8B6B55',
  textDisabled: '#C4A990',

  // Border / Divider
  border: '#F0E2D2',
  divider: '#F7EEE4',

  // Status
  success: '#A9B69A',
  warning: '#FBAE38',
  error: '#E57A72',

  // Buttons
  buttonPrimaryBg: '#FA6F37',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FFF5EC',
  buttonSecondaryText: '#E88F48',
  buttonDisabledBg: '#F3E8DC',
  buttonDisabledText: '#C4A990',

  // Energy / Progress
  energyFill: '#FA6F37',
  energyTrack: '#F3E8DC',

  // Icon soft backgrounds
  iconFeed: '#FFE8D8',
  iconToy: '#F5EEF8',
  iconAttendance: '#EEF5FF',
  iconReward: '#FFF4D8',
  iconHeart: '#FDEEF2',
} as const

export type ColorToken = keyof typeof Colors

/** Shadow System */
export const Shadows = {
  elevation: {
    shadowColor: '#4A3427',
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
