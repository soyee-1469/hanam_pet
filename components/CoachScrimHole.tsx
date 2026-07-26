import { useMemo } from 'react'
import {
  View,
  StyleSheet,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Svg, { Defs, Mask, Rect, Path } from 'react-native-svg'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 구멍. null이면 전체 진한 딤 */
  hole: CoachHoleRect | null
  /** 구멍 모서리 */
  radius?: number
  /** 구멍 여백 (기본 6) */
  pad?: number
  style?: ViewStyle
}

const SCRIM = 'rgba(22, 12, 8, 0.86)'
const EDGE = 'rgba(122, 91, 69, 0.55)'
const DEFAULT_PAD = 6

function roundedHolePath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const rx = Math.min(r, w / 2, h / 2)
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

/**
 * 투어 딤 + 둥근 컷아웃.
 * 흰 링·후광 없이 얇은 코코아 헤어라인만.
 */
export function CoachScrimHole({
  hole,
  radius = 20,
  pad = DEFAULT_PAD,
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
  const maskId = `coach-hole-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}-${Math.round(h)}`
  const holePath = roundedHolePath(x, y, w, h, rx)

  return (
    <View pointerEvents="box-none" style={[styles.layer, style]}>
      <Svg
        pointerEvents="none"
        width={svgW}
        height={svgH}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <Mask id={maskId}>
            <Rect x={0} y={0} width={svgW} height={svgH} fill="#fff" />
            <Path d={holePath} fill="#000" />
          </Mask>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={svgW}
          height={svgH}
          fill={SCRIM}
          mask={`url(#${maskId})`}
        />
        {/* 얇은 코코아 라인 — 흰 링/글로우 대체 */}
        <Path
          d={holePath}
          fill="none"
          stroke={EDGE}
          strokeWidth={1.25}
        />
      </Svg>

      {/* 터치만 막음 */}
      <View
        pointerEvents="auto"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: rx,
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
