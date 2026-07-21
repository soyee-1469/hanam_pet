/**
 * Hanam Healing Pet Color System v3.1
 * 힐링 중심 팔레트 — 브라운·크림 베이스, 오렌지는 CTA·감정 포인트만
 *
 * 권장 비율
 * - 브라운 45% · 크림/베이지 35% · 오렌지 15% · 옐로 5%
 *
 * Core
 * - Cocoa        #7A5B45  제목·본문 (textPrimary)
 * - Selected     #8A5B44  칩·선택 상태
 * - Accent       #F4C85B  따뜻한 포인트 옐로 (소량)
 * - AccentSoft   #FBECC4  Accent 연한 면
 * - CreamyBeige  #F6EFE5  연한 배경·카드 분위기 (Accent와 분리)
 * - Secondary    #FF8F7A  CTA 보조 오렌지
 * - Primary      #FF8F7A  메인 CTA / 긍정 감정
 * - MoodOk       #D4E08A  감정「보통」
 *
 * Primary·Secondary(오렌지) 사용처
 * 1) Primary 버튼  2) 선택 탭/네비  3) 기분 좋음
 * 에너지(번개·바·칩)는 전부 Accent 옐로 — Primary 코랄 금지
 * 칩·필터 선택 상태는 Selected(브라운) — 오렌지 금지
 *
 * 감정 색
 * - 좋음 → moodGood (Primary 오렌지)
 * - 보통 → moodOk
 * - 힘듦 → moodHard (스카이 블루)
 */

export const Colors = {
  // —— Core brown / cream (힐링 베이스) ——
  /** 제목·본문 코코아 */
  cocoa: '#7A5B45',
  textPrimary: '#7A5B45',
  textSecondary: '#8E6F5C',
  textDisabled: '#B79A8A',

  /** 연령·성별·필터 칩 선택 상태 */
  selected: '#8A5B44',
  /** @deprecated Colors.selected 사용 */
  chipSelected: '#8A5B44',

  creamyBeige: '#F6EFE5',
  background: '#F8F4EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5EDE6',
  peach: '#FFD0C6',
  sand: '#E9DCCF',
  beige: '#D9C7BA',

  // —— Accent yellow (소량) ——
  accent: '#F4C85B',
  accentSoft: '#FBECC4',

  // —— CTA / brand orange ——
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

  // Border / Divider
  border: '#E9DCCF',
  divider: '#F1E9E0',

  // Status
  success: '#A9B69A',
  warning: '#FF8F7A',
  error: '#C4847E',
  /** 삭제·위험 아이콘 연한 면 (Primary 계열) */
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
  buttonDisabledBg: '#E9DCCF',
  buttonDisabledText: '#B79A8A',

  // Energy / Progress — 전부 Accent 옐로 (번개 = yellow lightning)
  /** 에너지 바·아이콘 채움 */
  energyFill: '#F4C85B',
  /** 중간·완충 — Accent 계열 (동일 옐로 유지) */
  energyFillMid: '#F4C85B',
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
    tint: Colors.primary,
    tabIconDefault: Colors.textDisabled,
    tabIconSelected: Colors.primary,
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
