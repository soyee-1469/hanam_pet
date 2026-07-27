import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native'
import { Colors } from '../constants/Colors'

/** 윗줄 — 실제 한글 키패드처럼 키 위에 1–0 숫자 표기 */
const TOP_ROW: { key: string; digit: string }[] = [
  { key: 'ㅂ', digit: '1' },
  { key: 'ㅈ', digit: '2' },
  { key: 'ㄷ', digit: '3' },
  { key: 'ㄱ', digit: '4' },
  { key: 'ㅅ', digit: '5' },
  { key: 'ㅛ', digit: '6' },
  { key: 'ㅕ', digit: '7' },
  { key: 'ㅑ', digit: '8' },
  { key: 'ㅐ', digit: '9' },
  { key: 'ㅔ', digit: '0' },
]

const ROWS = [
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
] as const

const KEYBOARD_H = 276

type Props = {
  visible: boolean
  /** 하단 safe area — 키패드 안쪽에만 패딩 */
  bottomInset?: number
  onInsert?: (ch: string) => void
  onBackspace?: () => void
  onHide?: () => void
}

/**
 * 하단 독용 소프트 키패드.
 * absolute 오버레이가 아니라 레이아웃 흐름에 끼워
 * 바로 위(버튼·입력창)에 붙인다.
 */
export function MockSoftKeyboard({
  visible,
  bottomInset = 0,
  onInsert,
  onBackspace,
  onHide,
}: Props) {
  const height = useRef(new Animated.Value(visible ? KEYBOARD_H : 0)).current
  const padBottom = Math.max(bottomInset, 8)

  useEffect(() => {
    Animated.timing(height, {
      toValue: visible ? KEYBOARD_H + padBottom : 0,
      duration: 260,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [visible, height, padBottom])

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
      style={[styles.shell, { height }]}
    >
      <View style={[styles.wrap, { paddingBottom: padBottom }]}>
        <View style={styles.handle} />
        <View style={styles.row}>
          {TOP_ROW.map(({ key, digit }) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${key} ${digit}`}
              onPress={() => onInsert?.(key)}
              style={({ pressed }) => [
                styles.key,
                styles.keyTop,
                pressed && styles.keyPressed,
              ]}
            >
              <Text style={styles.keyDigit} numberOfLines={1}>
                {digit}
              </Text>
              <Text style={styles.keyTextTop} numberOfLines={1}>
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
        {ROWS.map((row, ri) => (
          <View key={`r-${ri}`} style={styles.row}>
            {ri === 1 ? <View style={styles.sideSpacer} /> : null}
            {row.map((key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key}
                onPress={() => onInsert?.(key)}
                style={({ pressed }) => [
                  styles.key,
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={styles.keyText}>{key}</Text>
              </Pressable>
            ))}
            {ri === 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="지우기"
                onPress={onBackspace}
                style={({ pressed }) => [
                  styles.keyWide,
                  pressed && styles.keyPressed,
                ]}
              >
                <Text style={styles.keyTextMuted}>⌫</Text>
              </Pressable>
            ) : (
              <View style={styles.sideSpacer} />
            )}
          </View>
        ))}
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="완료"
            onPress={onHide}
            style={({ pressed }) => [
              styles.keyAction,
              pressed && styles.keyPressed,
            ]}
          >
            <Text style={styles.keyActionText}>완료</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="띄어쓰기"
            onPress={() => onInsert?.(' ')}
            style={({ pressed }) => [
              styles.space,
              pressed && styles.keyPressed,
            ]}
          >
            <Text style={styles.keyTextMuted}>space</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="줄바꿈"
            onPress={() => onInsert?.('\n')}
            style={({ pressed }) => [
              styles.keyAction,
              pressed && styles.keyPressed,
            ]}
          >
            <Text style={styles.keyActionText}>return</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  )
}

export const MOCK_SOFT_KEYBOARD_HEIGHT = KEYBOARD_H

const styles = StyleSheet.create({
  shell: {
    flexShrink: 0,
    overflow: 'hidden',
    width: '100%',
  },
  wrap: {
    backgroundColor: '#D6D0C8',
    paddingTop: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      web: {
        boxShadow: 'none',
      },
      default: {
        shadowColor: Colors.cocoa,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 0,
      },
    }),
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.beige,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    gap: 5,
  },
  key: {
    flex: 1,
    maxWidth: 34,
    height: 42,
    borderRadius: 7,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  /** 윗줄 — 숫자(1–0) + 글자 세로 스택 */
  keyTop: {
    height: 46,
    justifyContent: 'flex-start',
    paddingTop: 3,
    gap: 0,
  },
  keyWide: {
    width: 44,
    height: 42,
    borderRadius: 7,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAction: {
    width: 72,
    height: 42,
    borderRadius: 7,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  space: {
    flex: 1,
    height: 42,
    borderRadius: 7,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    opacity: 0.72,
  },
  keyDigit: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  keyTextTop: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  keyTextMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  keyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sideSpacer: {
    width: 18,
  },
})
