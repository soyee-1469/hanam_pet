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

/** 바깥 딤 — 구멍 안에는 절대 칠하지 않음 */
const SCRIM = 'rgba(18, 10, 6, 0.82)'
const EDGE = 'rgba(122, 91, 69, 0.45)'
const DEFAULT_PAD = 2

function roundedEdgePath(
  w: number,
  h: number,
  r: number,
  roundTopOnly: boolean,
): string {
  const rx = Math.min(r, w / 2, h / 2)
  if (roundTopOnly) {
    return [
      `M 0 ${h}`,
      `V ${rx}`,
      `A ${rx} ${rx} 0 0 1 ${rx} 0`,
      `H ${w - rx}`,
      `A ${rx} ${rx} 0 0 1 ${w} ${rx}`,
      `V ${h}`,
    ].join(' ')
  }
  return [
    `M ${rx} 0`,
    `H ${w - rx}`,
    `A ${rx} ${rx} 0 0 1 ${w} ${rx}`,
    `V ${h - rx}`,
    `A ${rx} ${rx} 0 0 1 ${w - rx} ${h}`,
    `H ${rx}`,
    `A ${rx} ${rx} 0 0 1 0 ${h - rx}`,
    `V ${rx}`,
    `A ${rx} ${rx} 0 0 1 ${rx} 0`,
  ].join(' ')
}

/** 사각 구멍 네 모서리 — 둥근 구멍 밖·사각 안 쐐기만 딤 */
function cornerWedgePaths(
  w: number,
  h: number,
  r: number,
  roundTopOnly: boolean,
): string[] {
  const rx = Math.min(r, w / 2, h / 2)
  if (rx <= 0) return []
  const paths = [
    // TL
    `M 0 0 H ${rx} A ${rx} ${rx} 0 0 0 0 ${rx} Z`,
    // TR
    `M ${w} 0 H ${w - rx} A ${rx} ${rx} 0 0 1 ${w} ${rx} Z`,
  ]
  if (!roundTopOnly) {
    paths.push(
      // BL
      `M 0 ${h} H ${rx} A ${rx} ${rx} 0 0 1 0 ${h - rx} Z`,
      // BR
      `M ${w} ${h} H ${w - rx} A ${rx} ${rx} 0 0 0 ${w} ${h - rx} Z`,
    )
  }
  return paths
}

/**
 * 투어 딤 + 완전 투명 구멍.
 * evenodd/마스크 대신 상하좌우 View로 뚫어 구멍 안이 절대 어두워지지 않게 한다.
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
  const wedges = cornerWedgePaths(w, h, rx, roundTopOnly)
  const edge = roundedEdgePath(w, h, rx, roundTopOnly)

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
        style={[
          styles.scrim,
          { left: 0, right: 0, top: y + h, height: Math.max(0, winH - (y + h)) },
        ]}
      />
      {/* 좌 */}
      <View
        pointerEvents="auto"
        style={[styles.scrim, { left: 0, top: y, width: x, height: h }]}
      />
      {/* 우 */}
      <View
        pointerEvents="auto"
        style={[
          styles.scrim,
          {
            left: x + w,
            top: y,
            width: Math.max(0, winW - (x + w)),
            height: h,
          },
        ]}
      />

      {/* 둥근 모서리 쐐기만 — 구멍 중앙은 비움 */}
      <Svg
        pointerEvents="none"
        width={w}
        height={h}
        style={{ position: 'absolute', left: x, top: y }}
      >
        {wedges.map((d, i) => (
          <Path key={i} d={d} fill={SCRIM} />
        ))}
        <Path
          d={edge}
          fill="none"
          stroke={EDGE}
          strokeWidth={1.25}
        />
      </Svg>

      {/* 구멍 위 터치만 막음 (배경 없음 → 밝기 유지) */}
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
          backgroundColor: 'transparent',
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
