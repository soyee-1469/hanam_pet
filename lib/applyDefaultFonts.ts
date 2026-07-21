import { Text, TextInput, StyleSheet, type StyleProp, type TextStyle } from 'react-native'
import { Fonts } from '../constants/Typography'

type WithDefaultProps = {
  defaultProps?: { style?: object | object[] | null }
}

type JsxRuntime = {
  jsx: (...args: unknown[]) => unknown
  jsxs: (...args: unknown[]) => unknown
  jsxDEV?: (...args: unknown[]) => unknown
  __pretendardPatched?: boolean
}

let applied = false

const PRETENDARD = new Set<string>([
  Fonts.ui,
  Fonts.uiMedium,
  Fonts.uiSemiBold,
  Fonts.uiBold,
])

/**
 * 피그마가 `Pretendard Medium` / `PretendardSemiBold`처럼
 * 로드 키와 다른 이름을 붙여도 앱 페이스로 맞춤.
 * 알 수 없는 Pretendard 변형은 undefined → fontWeight로 재매핑.
 */
function normalizeUiFamily(
  family: string | undefined,
): string | undefined {
  if (!family) return undefined
  if (PRETENDARD.has(family)) return family

  const key = family.replace(/[\s_-]+/g, '').toLowerCase()
  if (!key.startsWith('pretendard')) return family

  if (key === 'pretendard' || key === 'pretendardregular') return Fonts.ui
  if (key === 'pretendardmedium') return Fonts.uiMedium
  if (key === 'pretendardsemibold') return Fonts.uiSemiBold
  if (key === 'pretendardbold') return Fonts.uiBold
  return undefined
}

function familyForWeight(weight: TextStyle['fontWeight']): string {
  const w = String(weight ?? '400')
  if (w === '500') return Fonts.uiMedium
  if (w === '600') return Fonts.uiSemiBold
  if (w === '700' || w === '800' || w === '900' || w === 'bold') {
    return Fonts.uiBold
  }
  return Fonts.ui
}

/**
 * Pretendard is loaded as separate faces. RN will not fake-bold
 * `Pretendard-Regular` via fontWeight — map weight → face and drop weight.
 * Figma-style names (`Pretendard Medium` 등)은 로드된 페이스로 정규화.
 */
export function resolveUiTextStyle(
  style: StyleProp<TextStyle> | undefined | null,
): TextStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle
  const { fontWeight, fontFamily, ...rest } = flat
  const normalized = normalizeUiFamily(fontFamily)

  // SpaceMono 등 Pretendard가 아닌 커스텀 페이스는 그대로
  if (normalized && !PRETENDARD.has(normalized)) {
    return flat
  }

  if (
    normalized === Fonts.uiMedium ||
    normalized === Fonts.uiSemiBold ||
    normalized === Fonts.uiBold
  ) {
    // 이미 굵기 페이스가 지정된 경우 — weight만 제거해 이중 지정 방지
    return { ...rest, fontFamily: normalized }
  }

  return {
    ...rest,
    fontFamily: familyForWeight(fontWeight),
  }
}

function patchHostRender(Comp: typeof Text | typeof TextInput) {
  const host = Comp as typeof Comp & {
    render?: (props: { style?: StyleProp<TextStyle> }, ref?: unknown) => unknown
    __pretendardRenderPatched?: boolean
  }
  if (host.__pretendardRenderPatched) return
  if (typeof host.render !== 'function') return

  host.__pretendardRenderPatched = true
  const original = host.render.bind(host)
  host.render = (props, ref) =>
    original({ ...props, style: resolveUiTextStyle(props?.style) }, ref)
}

function patchJsxRuntime() {
  let jsxRuntime: JsxRuntime
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jsxRuntime = require('react/jsx-runtime') as JsxRuntime
  } catch {
    return
  }
  if (jsxRuntime.__pretendardPatched) return
  jsxRuntime.__pretendardPatched = true

  const wrap =
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) => {
      const type = args[0]
      const props = args[1] as Record<string, unknown> | null | undefined
      if (
        (type === Text || type === TextInput) &&
        props != null &&
        props.style != null
      ) {
        args[1] = {
          ...props,
          style: resolveUiTextStyle(props.style as StyleProp<TextStyle>),
        }
      }
      return fn(...args)
    }

  jsxRuntime.jsx = wrap(jsxRuntime.jsx)
  jsxRuntime.jsxs = wrap(jsxRuntime.jsxs)
  if (typeof jsxRuntime.jsxDEV === 'function') {
    jsxRuntime.jsxDEV = wrap(jsxRuntime.jsxDEV)
  }
}

/**
 * Apply Pretendard as the app-wide default for Text / TextInput,
 * and remap fontWeight 500/600/700+ onto Medium / SemiBold / Bold faces.
 */
export function applyDefaultFonts() {
  if (applied) return
  applied = true

  const base = { fontFamily: Fonts.ui }
  const TextComp = Text as typeof Text & WithDefaultProps
  const InputComp = TextInput as typeof TextInput & WithDefaultProps

  TextComp.defaultProps = {
    ...TextComp.defaultProps,
    style: StyleSheet.flatten([TextComp.defaultProps?.style, base]),
  }
  InputComp.defaultProps = {
    ...InputComp.defaultProps,
    style: StyleSheet.flatten([InputComp.defaultProps?.style, base]),
  }

  patchHostRender(Text)
  patchHostRender(TextInput)
  patchJsxRuntime()
}
