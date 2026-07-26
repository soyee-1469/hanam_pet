import { useMemo } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Colors } from '../constants/Colors'

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
  /** 구멍 테두리(스포트라이트 링) */
  showRing?: boolean
  style?: ViewStyle
}

const SCRIM = 'rgba(91, 57, 39, 0.35)'
const PAD = 4

/**
 * 코치마크 딤 — 하이라이트 영역만 뚫어 실제 UI가 화면 앞으로 나오게 한다.
 * (zIndex로 올리는 방식은 웹 스택 컨텍스트에 막혀 실패하기 쉬움)
 */
export function CoachScrimHole({
  hole,
  radius = 20,
  showRing = true,
  style,
}: CoachScrimHoleProps) {
  const bands = useMemo(() => {
    if (!hole || hole.w <= 0 || hole.h <= 0) return null
    const x = Math.max(0, hole.x - PAD)
    const y = Math.max(0, hole.y - PAD)
    const w = hole.w + PAD * 2
    const h = hole.h + PAD * 2
    return { x, y, w, h, r: radius + PAD }
  }, [hole, radius])

  if (!bands) {
    return (
      <View
        pointerEvents="auto"
        style={[styles.layer, style]}
      >
        <View style={[styles.fill, styles.scrim]} />
      </View>
    )
  }

  const { x, y, w, h, r } = bands

  return (
    <View pointerEvents="box-none" style={[styles.layer, style]}>
      {/* 상 */}
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, right: 0, top: 0, height: y }]}
      />
      {/* 하 */}
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, right: 0, top: y + h, bottom: 0 }]}
      />
      {/* 좌 */}
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, width: x, top: y, height: h }]}
      />
      {/* 우 */}
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: x + w, right: 0, top: y, height: h }]}
      />
      {/* 구멍 위 터치 차단 (탭은 Next만) */}
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
      {showRing ? (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: r,
            },
          ]}
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
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: Colors.selected,
    backgroundColor: 'transparent',
  },
})
