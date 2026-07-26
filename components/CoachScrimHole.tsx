import { useMemo } from 'react'
import {
  View,
  StyleSheet,
  type ViewStyle,
  useWindowDimensions,
  Platform,
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
  style?: ViewStyle
}

const SCRIM = 'rgba(22, 12, 8, 0.84)'
/** 하이라이트 여백 — 카드처럼 숨 쉬게 */
const CUT_PAD = 12

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
 * 투어 딤 + 부드러운 영역 리프트.
 * 딱딱한 테두리 대신 크림 글로우·흰 소프트 링.
 */
export function CoachScrimHole({
  hole,
  radius = 22,
  style,
}: CoachScrimHoleProps) {
  const { width: winW, height: winH } = useWindowDimensions()

  const cut = useMemo(() => {
    if (!hole || hole.w <= 0 || hole.h <= 0) return null
    return {
      x: Math.max(0, hole.x - CUT_PAD),
      y: Math.max(0, hole.y - CUT_PAD),
      w: hole.w + CUT_PAD * 2,
      h: hole.h + CUT_PAD * 2,
    }
  }, [hole])

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
      </Svg>

      {/* 소프트 후광만 — 딱딱한 흰 테두리 링 없음 */}
      <View
        pointerEvents="none"
        style={[
          styles.glowOuter,
          {
            left: x - 10,
            top: y - 10,
            width: w + 20,
            height: h + 20,
            borderRadius: rx + 10,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glowInner,
          {
            left: x - 3,
            top: y - 3,
            width: w + 6,
            height: h + 6,
            borderRadius: rx + 3,
          },
        ]}
      />

      {/* 구멍 위 터치만 막음 */}
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
  glowOuter: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 248, 240, 0.16)',
  },
  glowInner: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFF8F0',
        shadowOpacity: 0.55,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      },
      android: { elevation: 6 },
      default: {
        shadowColor: '#FFF8F0',
        shadowOpacity: 0.45,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
})
