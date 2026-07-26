import { useMemo } from 'react'
import {
  View,
  StyleSheet,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native'
import Svg, { Rect } from 'react-native-svg'
import { Colors } from '../constants/Colors'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 하이라이트 영역. null이면 전체 딤만 */
  hole: CoachHoleRect | null
  /** 모서리 */
  radius?: number
  /** 여백 (기본 3) */
  pad?: number
  /** 호환용 — 아웃라인 모드에서는 무시 */
  roundTopOnly?: boolean
  style?: ViewStyle
}

const SCRIM = 'rgba(20, 10, 6, 0.72)'
const RING = Colors.cocoa
const DEFAULT_PAD = 3

/**
 * 투어 딤 + 영역 아웃라인.
 * 구멍을 뚫지 않아 흰 카드가 떠 보이는 느낌을 없앤다.
 */
export function CoachScrimHole({
  hole,
  radius = 18,
  pad = DEFAULT_PAD,
  style,
}: CoachScrimHoleProps) {
  const { width: winW, height: winH } = useWindowDimensions()

  const frame = useMemo(() => {
    if (!hole || hole.w <= 0 || hole.h <= 0) return null
    return {
      x: Math.max(0, hole.x - pad),
      y: Math.max(0, hole.y - pad),
      w: hole.w + pad * 2,
      h: hole.h + pad * 2,
    }
  }, [hole, pad])

  const rx = frame ? Math.min(radius, frame.w / 2, frame.h / 2) : 0

  return (
    <View pointerEvents="box-none" style={[styles.layer, style]}>
      <View pointerEvents="auto" style={[styles.fill, styles.scrim]} />

      {frame ? (
        <Svg
          pointerEvents="none"
          width={Math.max(winW, frame.x + frame.w + 8)}
          height={Math.max(winH, frame.y + frame.h + 8)}
          style={StyleSheet.absoluteFill}
        >
          <Rect
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
            rx={rx}
            ry={rx}
            fill="none"
            stroke={RING}
            strokeWidth={2.5}
          />
        </Svg>
      ) : null}

      {frame ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: frame.x,
            top: frame.y,
            width: frame.w,
            height: frame.h,
            borderRadius: rx,
          }}
        />
      ) : null}
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
