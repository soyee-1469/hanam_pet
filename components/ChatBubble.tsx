import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors } from '../constants/Colors'

type ChatBubbleVariant = 'user' | 'pet'

type ChatBubbleProps = {
  /** user = 노랑·우측 꼬리 / pet = 흰·좌측 꼬리 */
  variant: ChatBubbleVariant
  children: ReactNode
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  /** 말풍선 면색과 맞출 꼬리 색 (기본: variant 색) */
  tailColor?: string
}

/**
 * 대화 말풍선 — 노란색(질문) 우측 꼬리, 흰색(캐릭터) 좌측 꼬리.
 */
export function ChatBubble({
  variant,
  children,
  style,
  contentStyle,
  tailColor,
}: ChatBubbleProps) {
  const isUser = variant === 'user'
  const fill =
    tailColor ?? (isUser ? Colors.accentSoft : Colors.surface)

  return (
    <View style={[styles.wrap, isUser ? styles.wrapUser : styles.wrapPet, style]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubblePet,
          contentStyle,
        ]}
      >
        {children}
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.tail,
          isUser ? styles.tailRight : styles.tailLeft,
          { backgroundColor: fill },
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
  tail: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: 12,
    transform: [{ rotate: '45deg' }],
  },
  /** 노란 말풍선 — 우측 꼬리 */
  tailRight: {
    right: -5,
  },
  /** 흰 말풍선 — 좌측 꼬리 (+ 테두리) */
  tailLeft: {
    left: -5,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
})
