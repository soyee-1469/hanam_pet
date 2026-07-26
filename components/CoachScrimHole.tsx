import { useMemo } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'

export type CoachHoleRect = {
  x: number
  y: number
  w: number
  h: number
}

type CoachScrimHoleProps = {
  /** 부모(absoluteFill) 기준 구멍. null이면 전체 옅은 딤 */
  hole: CoachHoleRect | null
  /** 구멍 모서리 — 대상 UI와 맞춤 */
  radius?: number
  style?: ViewStyle
}

/** 정리된 코치마크용 — 옅은 딤 + 구멍만 (테두리/링 없음) */
const SCRIM = 'rgba(91, 57, 39, 0.22)'
const CUT_PAD = 6

/**
 * 6단계 투어용 딤.
 * 하드 테두리 없이, 대상만 밝게 남기고 카드 꼬리로 가리킨다.
 */
export function CoachScrimHole({
  hole,
  radius: _radius = 20,
  style,
}: CoachScrimHoleProps) {
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

  return (
    <View pointerEvents="box-none" style={[styles.layer, style]}>
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, right: 0, top: 0, height: y }]}
      />
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, right: 0, top: y + h, bottom: 0 }]}
      />
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, width: x, top: y, height: h }]}
      />
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: x + w, right: 0, top: y, height: h }]}
      />
      {/* 구멍 — 터치만 막고 링/테두리 없음 */}
      <View
        pointerEvents="auto"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
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
