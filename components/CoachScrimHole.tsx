import { useMemo } from 'react'
import {
  View,
  StyleSheet,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 구멍. null이면 전체 딤 */
  hole: CoachHoleRect | null
  /** 구멍 모서리 */
  radius?: number
  /** 구멍 여백 (기본 2) */
  pad?: number
  /** 상단만 둥글게 (탭바 등) */
  roundTopOnly?: boolean
  style?: ViewStyle
}

const SCRIM = 'rgba(20, 10, 6, 0.86)'
/** 웹 AA 흰 번짐 가림 — 흰 링이 아닌 어두운 코코아 */
const EDGE = '#2A1A12'
const DEFAULT_PAD = 2

function roundedCw(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  roundTopOnly = false,
): string {
  const rx = Math.min(r, w / 2, h / 2)
  if (roundTopOnly) {
    return [
      `M ${x} ${y + h}`,
      `V ${y + rx}`,
      `A ${rx} ${rx} 0 0 1 ${x + rx} ${y}`,
      `H ${x + w - rx}`,
      `A ${rx} ${rx} 0 0 1 ${x + w} ${y + rx}`,
      `V ${y + h}`,
      'Z',
    ].join(' ')
  }
  return [
    `M ${x + rx} ${y}`,
    `H ${x + w - rx}`,
    `A ${rx} ${rx} 0 0 1 ${x + w} ${y + rx}`,
    `V ${y + h - rx}`,
    `A ${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}`,
    `H ${x + rx}`,
    `A ${rx} ${rx} 0 0 1 ${x} ${y + h - rx}`,
    `V ${y + rx}`,
    `A ${rx} ${rx} 0 0 1 ${x + rx} ${y}`,
    'Z',
  ].join(' ')
}

function roundedCcw(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  roundTopOnly = false,
): string {
  const rx = Math.min(r, w / 2, h / 2)
  if (roundTopOnly) {
    return [
      `M ${x} ${y + h}`,
      `H ${x + w}`,
      `V ${y + rx}`,
      `A ${rx} ${rx} 0 0 0 ${x + w - rx} ${y}`,
      `H ${x + rx}`,
      `A ${rx} ${rx} 0 0 0 ${x} ${y + rx}`,
      'Z',
    ].join(' ')
  }
  return [
    `M ${x + rx} ${y}`,
    `A ${rx} ${rx} 0 0 0 ${x} ${y + rx}`,
    `V ${y + h - rx}`,
    `A ${rx} ${rx} 0 0 0 ${x + rx} ${y + h}`,
    `H ${x + w - rx}`,
    `A ${rx} ${rx} 0 0 0 ${x + w} ${y + h - rx}`,
    `V ${y + rx}`,
    `A ${rx} ${rx} 0 0 0 ${x + w - rx} ${y}`,
    'Z',
  ].join(' ')
}

/**
 * 투어 딤 + 진짜 구멍 컷아웃.
 * evenodd 패스 + 어두운 가장자리로 웹 AA 흰 링을 피한다.
 */
export function CoachScrimHole({
  hole,
  radius = 18,
  pad = DEFAULT_PAD,
  roundTopOnly = false,
  style,
}: CoachScrimHoleProps) {
  const { width: winW, height: winH } = useWindowDimensions()

  const cut = useMemo(() => {
    if (!hole || hole.w <= 0 || hole.h <= 0) return null
    return {
      x: Math.max(0, hole.x - pad),
      y: Math.max(0, hole.y - pad),
      w: hole.w + pad * 2,
      h: hole.h + pad * 2,
    }
  }, [hole, pad])

  if (!cut) {
    return (
      <View pointerEvents="auto" style={[styles.layer, style]}>
        <View style={[styles.fill, styles.scrim]} />
      </View>
    )
  }

  const { x, y, w, h } = cut
  const rx = Math.min(radius, w / 2, h / 2)
  const svgW = Math.max(winW, x + w + 24)
  const svgH = Math.max(winH, y + h + 24)
  const edgePath = roundedCw(x, y, w, h, rx, roundTopOnly)
  const fillPath = `M 0 0 H ${svgW} V ${svgH} H 0 Z ${roundedCcw(x, y, w, h, rx, roundTopOnly)}`

  return (
    <View pointerEvents="box-none" style={[styles.layer, style]}>
      <Svg
        pointerEvents="none"
        width={svgW}
        height={svgH}
        style={StyleSheet.absoluteFill}
      >
        <Path d={fillPath} fill={SCRIM} fillRule="evenodd" />
        <Path d={edgePath} fill="none" stroke={EDGE} strokeWidth={1.5} />
      </Svg>

      {/* 구멍 위 터치 차단 */}
      <View
        pointerEvents="auto"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderTopLeftRadius: rx,
          borderTopRightRadius: rx,
          borderBottomLeftRadius: roundTopOnly ? 0 : rx,
          borderBottomRightRadius: roundTopOnly ? 0 : rx,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    position: 'absolute',
    backgroundColor: SCRIM,
  },
})
