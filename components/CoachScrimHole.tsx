import { useMemo } from 'react'
import { View, StyleSheet, type ViewStyle, useWindowDimensions } from 'react-native'
import Svg, { Defs, Mask, Rect } from 'react-native-svg'
import { Colors } from '../constants/Colors'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 구멍. null이면 전체 옅은 딤 */
  hole: CoachHoleRect | null
  /** 구멍·테두리 모서리 — 대상 UI와 맞춤 */
  radius?: number
  style?: ViewStyle
}

const SCRIM = 'rgba(91, 57, 39, 0.22)'
const CUT_PAD = 6
const BORDER = 2

/**
 * 6단계 투어용 딤.
 * 둥근 구멍 + 코코아 테두리로 대상을 가리키고, 카드 꼬리와 맞춘다.
 */
export function CoachScrimHole({
  hole,
  radius = 20,
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
  // 레이어가 화면보다 클 수 있어 여유분
  const svgW = Math.max(winW, x + w + 8)
  const svgH = Math.max(winH, y + h + 8)
  const maskId = `coach-hole-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}-${Math.round(h)}`

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
            <Rect x={x} y={y} width={w} height={h} rx={rx} ry={rx} fill="#000" />
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

      {/* 구멍 위 터치 차단 */}
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

      {/* 둥근 코코아 테두리 */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: rx,
          borderWidth: BORDER,
          borderColor: Colors.cocoa,
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
