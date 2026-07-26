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
  /**
   * 구멍 모서리 — 하이라이트 프레임과 동일 값 사용
   * (코랄 금지 · 코코아 링)
   */
  radius?: number
  /** 구멍 테두리(스포트라이트 링). 프레임이 이미 테두리면 false */
  showRing?: boolean
  style?: ViewStyle
}

const SCRIM = 'rgba(91, 57, 39, 0.35)'
/** 스크림만 살짝 여유 — 링 좌표/라디우스는 hole 그대로 */
const CUT_PAD = 3

/**
 * 코치마크 딤 — 하이라이트 영역만 뚫어 실제 UI가 화면 앞으로 나오게 한다.
 * 테두리는 Colors.cocoa (CTA 코랄 사용 금지).
 */
export function CoachScrimHole({
  hole,
  radius = 20,
  showRing = true,
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
      {showRing && hole ? (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: hole.x,
              top: hole.y,
              width: hole.w,
              height: hole.h,
              borderRadius: radius,
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
    /** 코랄(primary) 금지 — 선택/하이라이트는 cocoa */
    borderColor: Colors.cocoa,
    backgroundColor: 'transparent',
  },
})
