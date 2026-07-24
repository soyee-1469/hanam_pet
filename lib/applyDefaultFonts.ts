import { StyleSheet, type StyleProp, type TextStyle } from 'react-native'

/**
 * Strip leftover Pretendard (or other custom UI) fontFamily so the
 * platform default face is used. fontWeight stays intact.
 */
export function resolveUiTextStyle(
  style: StyleProp<TextStyle> | undefined | null,
): TextStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle
  const { fontFamily, ...rest } = flat
  if (!fontFamily) return flat

  const key = String(fontFamily).replace(/[\s_-]+/g, '').toLowerCase()
  if (key.startsWith('pretendard')) {
    return rest
  }
  // SpaceMono 등 의도적 커스텀 페이스는 유지
  return flat
}

/** @deprecated Pretendard 제거 — 시스템 기본 폰트 사용. no-op 유지(호환). */
export function applyDefaultFonts() {
  // intentionally empty
}
