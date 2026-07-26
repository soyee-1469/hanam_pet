import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Backspace } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'

type NumberKeypadProps = {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onNext: () => void
  nextLabel?: string
  disabled?: boolean
  nextDisabled?: boolean
}

const ROWS: (string | 'back' | 'next' | 'empty')[][] = [
  ['1', '2', '3', 'back'],
  ['4', '5', '6', 'next'],
  ['7', '8', '9', 'empty'],
  ['empty', '0', 'empty', 'empty'],
]

/**
 * 기록 가져오기 번호 등 — 인앱 숫자 키패드 (시스템 키패드 대체 표현)
 * 색은 MockSoftKeyboard(한글 패드)와 동일 톤
 */
export function NumberKeypad({
  onDigit,
  onBackspace,
  onNext,
  nextLabel = '다음',
  disabled,
  nextDisabled,
}: NumberKeypadProps) {
  return (
    <View style={styles.wrap} accessibilityRole="keyboardkey">
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key, ki) => {
            if (key === 'empty') {
              return <View key={`${ri}-${ki}`} style={styles.keySlot} />
            }
            if (key === 'back') {
              return (
                <Pressable
                  key={`${ri}-${ki}`}
                  accessibilityRole="button"
                  accessibilityLabel="지우기"
                  disabled={disabled}
                  onPress={onBackspace}
                  style={({ pressed }) => [
                    styles.keySlot,
                    styles.key,
                    styles.keyAction,
                    pressed && !disabled && styles.keyPressed,
                    disabled && styles.keyDisabled,
                  ]}
                >
                  <Backspace
                    size={22}
                    color={Colors.textSecondary}
                    weight="bold"
                  />
                </Pressable>
              )
            }
            if (key === 'next') {
              return (
                <Pressable
                  key={`${ri}-${ki}`}
                  accessibilityRole="button"
                  accessibilityLabel={nextLabel}
                  disabled={disabled || nextDisabled}
                  onPress={onNext}
                  style={({ pressed }) => [
                    styles.keySlot,
                    styles.key,
                    styles.keyAction,
                    pressed && !disabled && !nextDisabled && styles.keyPressed,
                    (disabled || nextDisabled) && styles.keyDisabled,
                  ]}
                >
                  <Text style={styles.nextText}>{nextLabel}</Text>
                </Pressable>
              )
            }
            return (
              <Pressable
                key={`${ri}-${ki}`}
                accessibilityRole="button"
                accessibilityLabel={key}
                disabled={disabled}
                onPress={() => onDigit(key)}
                style={({ pressed }) => [
                  styles.keySlot,
                  styles.key,
                  pressed && !disabled && styles.keyPressed,
                  disabled && styles.keyDisabled,
                ]}
              >
                <Text style={styles.digit}>{key}</Text>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    /** MockSoftKeyboard wrap과 동일 */
    backgroundColor: '#D6D0C8',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  keySlot: {
    flex: 1,
    minHeight: 46,
  },
  key: {
    borderRadius: 7,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 지우기·다음 — MockSoftKeyboard keyAction/keyWide와 동일 */
  keyAction: {
    backgroundColor: Colors.sand,
  },
  keyPressed: {
    opacity: 0.72,
  },
  keyDisabled: {
    opacity: 0.45,
  },
  digit: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
})
