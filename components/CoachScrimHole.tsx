import { useMemo } from 'react'
import {
  View,
  StyleSheet,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Svg, { Defs, Mask, Rect, Path } from 'react-native-svg'
import { Colors } from '../constants/Colors'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 구멍. null이면 전체 진한 딤 */
  hole: CoachHoleRect | null
  /** 구멍·테두리 모서리 — 대상 UI와 맞춤 */
  radius?: number
  /** 탭바 바로 위일 때 하단 모서리를 직각으로 */
  flatBottom?: boolean
  style?: ViewStyle
}

/** 네이버식 투어처럼 배경을 충분히 눌러 구멍을 살린다 */
const SCRIM = 'rgba(40, 24, 16, 0.72)'
const CUT_PAD = 4
const BORDER = 2

function roundedHolePath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  flatBottom: boolean,
): string {
  const rt = Math.min(r, w / 2, h / 2)
  const rb = flatBottom ? 0 : rt
  // 시계방향 둥근 사각 (하단 직각 가능)
  return [
    `M ${x + rt} ${y}`,
    `H ${x + w - rt}`,
    `A ${rt} ${rt} 0 0 1 ${x + w} ${y + rt}`,
    `V ${y + h - rb}`,
    rb > 0
      ? `A ${rb} ${rb} 0 0 1 ${x + w - rb} ${y + h}`
      : `L ${x + w} ${y + h}`,
    `H ${x + rb}`,
    rb > 0
      ? `A ${rb} ${rb} 0 0 1 ${x} ${y + h - rb}`
      : `L ${x} ${y + h}`,
    `V ${y + rt}`,
    `A ${rt} ${rt} 0 0 1 ${x + rt} ${y}`,
    'Z',
  ].join(' ')
}

/**
 * 6단계 투어용 딤.
 * 진한 딤 + 둥근 구멍 + 코코아 테두리.
 */
export function CoachScrimHole({
  hole,
  radius = 20,
  flatBottom = false,
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
  const svgW = Math.max(winW, x + w + 8)
  const svgH = Math.max(winH, y + h + 8)
  const maskId = `coach-hole-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}-${Math.round(h)}-${flatBottom ? 1 : 0}`
  const holePath = roundedHolePath(x, y, w, h, rx, flatBottom)
  const borderRadiusStyle = flatBottom
    ? {
        borderTopLeftRadius: rx,
        borderTopRightRadius: rx,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }
    : { borderRadius: rx }

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

      <View
        pointerEvents="auto"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          ...borderRadiusStyle,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderWidth: BORDER,
          borderColor: Colors.cocoa,
          ...borderRadiusStyle,
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
