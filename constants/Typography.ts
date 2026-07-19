/**
 * Font system — Pretendard only (entire UI).
 * OTFs: assets/fonts (from orioncactus/pretendard, OFL).
 *
 * Each weight is a separate face. Prefer Fonts.uiBold / uiSemiBold /
 * uiMedium over fontWeight alone (RN will not fake-bold Regular).
 * applyDefaultFonts also remaps fontWeight → these faces at render time.
 */
export const Fonts = {
  ui: 'Pretendard-Regular',
  uiMedium: 'Pretendard-Medium',
  uiSemiBold: 'Pretendard-SemiBold',
  uiBold: 'Pretendard-Bold',
} as const

export type FontKey = keyof typeof Fonts

/** Map for useFonts / loadAsync */
export const fontAssets = {
  [Fonts.ui]: require('../assets/fonts/Pretendard-Regular.otf'),
  [Fonts.uiMedium]: require('../assets/fonts/Pretendard-Medium.otf'),
  [Fonts.uiSemiBold]: require('../assets/fonts/Pretendard-SemiBold.otf'),
  [Fonts.uiBold]: require('../assets/fonts/Pretendard-Bold.otf'),
} as const
