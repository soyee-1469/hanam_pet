import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
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

const TAIL = 11

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
  const bordered = !isUser

  const towardPos = isUser ? styles.posBottomRight : styles.posBottomLeft
  const sidePos = isUser ? styles.posSideRight : styles.posSideLeft
  const seamToward = isUser ? styles.seamBottomRight : styles.seamBottomLeft
  const seamSide = isUser ? styles.seamSideRight : styles.seamSideLeft

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

      {toward ? (
        <>
          {bordered ? (
            <View
              pointerEvents="none"
              style={[styles.tailOutline, towardPos, styles.outlineNudgeToward]}
            />
          ) : null}
          <View
            pointerEvents="none"
            style={[styles.tailFill, towardPos, { backgroundColor: fill }]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.seamToward,
              seamToward,
              {
                backgroundColor: fill,
                height: bordered ? 3 : 2,
              },
            ]}
          />
        </>
      ) : (
        <>
          {bordered ? (
            <View
              pointerEvents="none"
              style={[styles.tailOutline, sidePos, styles.outlineNudgeSide]}
            />
          ) : null}
          <View
            pointerEvents="none"
            style={[styles.tailFill, sidePos, { backgroundColor: fill }]}
          />
          <View
            pointerEvents="none"
            style={[styles.seamSide, seamSide, { backgroundColor: fill }]}
          />
        </>
      )}
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tailFill: {
    position: 'absolute',
    width: TAIL,
    height: TAIL,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  tailOutline: {
    position: 'absolute',
    width: TAIL + 2,
    height: TAIL + 2,
    backgroundColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  /** 유저 — 오른쪽 아래 → 캐릭터 */
  posBottomRight: {
    right: 16,
    bottom: -(TAIL / 2) + 1,
  },
  /** 펫 — 왼쪽 아래 → 캐릭터 */
  posBottomLeft: {
    left: 16,
    bottom: -(TAIL / 2) + 1,
  },
  outlineNudgeToward: {
    bottom: -(TAIL / 2),
  },
  seamToward: {
    position: 'absolute',
    width: TAIL + 8,
    bottom: 0,
    zIndex: 3,
  },
  seamBottomRight: {
    right: 12,
  },
  seamBottomLeft: {
    left: 12,
  },
  posSideRight: {
    right: -(TAIL / 2) + 1,
    bottom: 14,
  },
  posSideLeft: {
    left: -(TAIL / 2) + 1,
    bottom: 14,
  },
  outlineNudgeSide: {
    // keep same anchor; larger box peeks as border
  },
  seamSide: {
    position: 'absolute',
    width: 3,
    height: TAIL + 8,
    bottom: 10,
    zIndex: 3,
  },
  seamSideRight: {
    right: 0,
  },
  seamSideLeft: {
    left: 0,
  },
})
