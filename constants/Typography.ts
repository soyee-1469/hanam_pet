/**
 * Typography scale — system default fonts (no custom face).
 * Prefer fontWeight on Text styles; platform default handles glyphs.
 */
export const Fonts = {
  /** @deprecated system default — do not set fontFamily */
  ui: undefined as unknown as string,
  uiMedium: undefined as unknown as string,
  uiSemiBold: undefined as unknown as string,
  uiBold: undefined as unknown as string,
} as const

export type FontKey = keyof typeof Fonts

/** No custom fonts to load */
export const fontAssets = {} as const

/** 앱 전역 텍스트 크기 — 페이지·컴포넌트 공통 기준 */
export const Type = {
  /** 스플래시·브랜드 */
  displayLg: 28,
  /** 완료·축하 히어로 */
  display: 26,
  /** 탭 루트·모달 타이틀 */
  titleLg: 22,
  /** ScreenHeader·페이지 히어로 */
  title: 18,
  /** 섹션 제목·Primary 버튼·카드 타이틀 */
  titleSm: 16,
  /** 본문·리스트 제목 */
  body: 15,
  /** 보조 본문 */
  bodyMd: 14,
  /** 설명·메타 */
  caption: 13,
  /** 타임스탬프·요일 */
  captionSm: 12,
  /** 칩·뱃지 */
  micro: 11,
  /** 점수·대형 숫자 */
  metric: 44,
  metricMd: 30,
} as const

/** 자주 쓰는 조합 — color만 추가해서 spread */
export const TypeStyle = {
  tabTitle: {
    fontSize: Type.titleLg,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
  },
  screenTitle: {
    fontSize: Type.title,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
  },
  modalTitle: {
    fontSize: Type.titleLg,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontSize: Type.titleSm,
    fontWeight: '700' as const,
  },
  listTitle: {
    fontSize: Type.titleSm,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: Type.body,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: Type.body,
    fontWeight: '500' as const,
  },
  bodySecondary: {
    fontSize: Type.bodyMd,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: Type.caption,
    fontWeight: '400' as const,
  },
  captionSm: {
    fontSize: Type.captionSm,
    fontWeight: '400' as const,
  },
  micro: {
    fontSize: Type.micro,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: Type.titleSm,
    fontWeight: '700' as const,
  },
  bubble: {
    fontSize: Type.titleSm,
    fontWeight: '600' as const,
  },
  bubbleSub: {
    fontSize: Type.caption,
    fontWeight: '500' as const,
  },
  hero: {
    fontSize: Type.display,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  displayLg: {
    fontSize: Type.displayLg,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
} as const
