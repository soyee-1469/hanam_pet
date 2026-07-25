import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors } from '../constants/Colors'

type ChatBubbleVariant = 'user' | 'pet'
type TailPlacement = 'side' | 'bottom'

type ChatBubbleProps = {
  /** user = 노랑 / pet = 흰 */
  variant: ChatBubbleVariant
  children: ReactNode
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  /** 말풍선 면색과 맞출 꼬리 색 (기본: variant 색) */
  tailColor?: string
  /**
   * side — user 우측 / pet 좌측 (메신저형)
   * bottom — 아래 중앙 (무대 가운데 정렬)
   */
  tail?: TailPlacement
}

/**
 * 대화 말풍선 — 노랑(질문) / 흰(캐릭터).
 */
export function ChatBubble({
  variant,
  children,
  style,
  contentStyle,
  tailColor,
  tail = 'side',
}: ChatBubbleProps) {
  const isUser = variant === 'user'
  const fill =
    tailColor ?? (isUser ? Colors.accentSoft : Colors.surface)
  const bottomTail = tail === 'bottom'

  return (
    <View
      style={[
        styles.wrap,
        isUser ? styles.wrapUser : styles.wrapPet,
        bottomTail && styles.wrapCenter,
        style,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubblePet,
          bottomTail && styles.bubbleBottomTail,
          contentStyle,
        ]}
      >
        {children}
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.tail,
          bottomTail
            ? styles.tailBottom
            : isUser
              ? styles.tailRight
              : styles.tailLeft,
          { backgroundColor: fill },
          bottomTail &&
            !isUser && {
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: Colors.border,
            },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    maxWidth: '100%',
  },
  wrapUser: {
    alignSelf: 'flex-end',
  },
  wrapPet: {
    alignSelf: 'flex-start',
  },
  wrapCenter: {
    alignSelf: 'center',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: Colors.accentSoft,
    borderBottomRightRadius: 4,
  },
  bubblePet: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleBottomTail: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  tail: {
    position: 'absolute',
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
  },
  /** 노란 말풍선 — 우측 꼬리 */
  tailRight: {
    right: -5,
    bottom: 12,
  },
  /** 흰 말풍선 — 좌측 꼬리 (+ 테두리) */
  tailLeft: {
    left: -5,
    bottom: 12,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  /** 무대형 — 아래 중앙 꼬리 */
  tailBottom: {
    bottom: -5,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -6,
  },
})
