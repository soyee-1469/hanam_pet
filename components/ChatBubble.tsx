import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { Colors } from '../constants/Colors'

type ChatBubbleVariant = 'user' | 'pet'
/** towardCharacter = 무대(캐릭터쪽 아래 꼬리) / side = 기록 목록(메신저형) */
type TailMode = 'towardCharacter' | 'side'

type ChatBubbleProps = {
  /** user = 노랑 · pet = 흰 */
  variant: ChatBubbleVariant
  children: ReactNode
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  /** 말풍선·꼬리 면색 (기본: variant 색) */
  tailColor?: string
  /**
   * towardCharacter — 유저 오른쪽 아래 / 펫 왼쪽 아래, 꼬리는 캐릭터 방향
   * side — 유저 우측 / 펫 좌측 (대화 기록)
   */
  tail?: TailMode
}

const TAIL_W = 16
const TAIL_H = 10
const STROKE = 1
const TAIL_INSET = 18

type TailAnchor = 'bottomLeft' | 'bottomRight' | 'sideLeft' | 'sideRight'

type TailProps = {
  fill: string
  stroke?: string
  anchor: TailAnchor
}

/**
 * 삼각 꼬리 — 옆 두 변만 stroke, 말풍선과 맞닿는 변은 fill로 가려 이어지게
 */
function BubbleTail({ fill, stroke, anchor }: TailProps) {
  const toward = anchor === 'bottomLeft' || anchor === 'bottomRight'
  const hasStroke = Boolean(stroke)

  const d = toward
    ? `M 0 0 L ${TAIL_W / 2} ${TAIL_H} L ${TAIL_W} 0 Z`
    : anchor === 'sideRight'
      ? `M 0 0 L ${TAIL_H} ${TAIL_W / 2} L 0 ${TAIL_W} Z`
      : `M ${TAIL_H} 0 L 0 ${TAIL_W / 2} L ${TAIL_H} ${TAIL_W} Z`

  const svgW = toward ? TAIL_W : TAIL_H
  const svgH = toward ? TAIL_H : TAIL_W

  const posStyle =
    anchor === 'bottomLeft'
      ? ({ left: TAIL_INSET, bottom: -TAIL_H + 2 } as const)
      : anchor === 'bottomRight'
        ? ({ right: TAIL_INSET, bottom: -TAIL_H + 2 } as const)
        : anchor === 'sideLeft'
          ? ({ left: -TAIL_H + 2, bottom: 12 } as const)
          : ({ right: -TAIL_H + 2, bottom: 12 } as const)

  return (
    <Svg
      pointerEvents="none"
      width={svgW}
      height={svgH}
      style={[styles.tailSvg, posStyle]}
    >
      <Path
        d={d}
        fill={fill}
        stroke={hasStroke ? stroke : 'none'}
        strokeWidth={hasStroke ? STROKE : 0}
        strokeLinejoin="round"
      />
      {hasStroke && toward ? (
        <Rect
          x={STROKE}
          y={-1}
          width={TAIL_W - STROKE * 2}
          height={3}
          fill={fill}
        />
      ) : null}
      {hasStroke && anchor === 'sideRight' ? (
        <Rect
          x={-1}
          y={STROKE}
          width={3}
          height={TAIL_W - STROKE * 2}
          fill={fill}
        />
      ) : null}
      {hasStroke && anchor === 'sideLeft' ? (
        <Rect
          x={TAIL_H - 2}
          y={STROKE}
          width={3}
          height={TAIL_W - STROKE * 2}
          fill={fill}
        />
      ) : null}
    </Svg>
  )
}

function seamStyle(anchor: TailAnchor, fill: string): StyleProp<ViewStyle> {
  if (anchor === 'bottomLeft') {
    return [
      styles.seamToward,
      { left: TAIL_INSET + 1, backgroundColor: fill },
    ]
  }
  if (anchor === 'bottomRight') {
    return [
      styles.seamToward,
      { right: TAIL_INSET + 1, backgroundColor: fill },
    ]
  }
  if (anchor === 'sideLeft') {
    return [styles.seamSide, { left: 0, backgroundColor: fill }]
  }
  return [styles.seamSide, { right: 0, backgroundColor: fill }]
}

/**
 * 대화 말풍선 — 동글동글 + 꼬리가 면에 이어짐.
 */
export function ChatBubble({
  variant,
  children,
  style,
  contentStyle,
  tailColor,
  tail = 'towardCharacter',
}: ChatBubbleProps) {
  const isUser = variant === 'user'
  const fill =
    tailColor ?? (isUser ? Colors.accentSoft : Colors.surface)
  const toward = tail === 'towardCharacter'
  const stroke = isUser ? undefined : Colors.border

  const anchor: TailAnchor = toward
    ? isUser
      ? 'bottomRight'
      : 'bottomLeft'
    : isUser
      ? 'sideRight'
      : 'sideLeft'

  return (
    <View
      style={[
        styles.wrap,
        toward
          ? isUser
            ? styles.wrapUserToward
            : styles.wrapPetToward
          : isUser
            ? styles.wrapUserSide
            : styles.wrapPetSide,
        style,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubblePet,
          contentStyle,
        ]}
      >
        {children}
      </View>

      <BubbleTail fill={fill} stroke={stroke} anchor={anchor} />

      {/* 펫만: 말풍선 하단/측면 테두리와 꼬리 접합부 덮개 */}
      {!isUser ? (
        <View pointerEvents="none" style={seamStyle(anchor, fill)} />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    maxWidth: '100%',
  },
  wrapUserToward: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  wrapPetToward: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  wrapUserSide: {
    alignSelf: 'flex-end',
  },
  wrapPetSide: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  bubbleUser: {
    backgroundColor: Colors.accentSoft,
  },
  bubblePet: {
    backgroundColor: Colors.surface,
    borderWidth: STROKE,
    borderColor: Colors.border,
  },
  tailSvg: {
    position: 'absolute',
    zIndex: 2,
  },
  seamToward: {
    position: 'absolute',
    width: TAIL_W - 2,
    height: STROKE + 1,
    bottom: 0,
    zIndex: 3,
  },
  seamSide: {
    position: 'absolute',
    width: STROKE + 1,
    height: TAIL_W - 2,
    bottom: 13,
    zIndex: 3,
  },
})
