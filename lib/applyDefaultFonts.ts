import { StyleSheet, type StyleProp, type TextStyle } from 'react-native'

/**
 * Pass-through — custom UI fonts (Pretendard 등) 미사용.
 * fontWeight만으로 시스템 기본 페이스를 쓴다.
 */
export function resolveUiTextStyle(
  style: StyleProp<TextStyle> | undefined | null,
): TextStyle {
  return (StyleSheet.flatten(style) ?? {}) as TextStyle
}

/** @deprecated no-op — 시스템 기본 폰트 */
export function applyDefaultFonts() {}
