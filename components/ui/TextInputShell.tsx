import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors } from '../../constants/Colors'

export type TextInputShellState = 'idle' | 'focused' | 'dirty' | 'error'

type TextInputShellProps = {
  children: ReactNode
  state?: TextInputShellState
  style?: StyleProp<ViewStyle>
}

const BORDER: Record<TextInputShellState, string> = {
  idle: Colors.border,
  focused: Colors.primary,
  dirty: Colors.primary,
  error: Colors.error,
}

/** 닉네임·폼 입력 셸 — focus / dirty / error 보더 */
export function TextInputShell({
  children,
  state = 'idle',
  style,
}: TextInputShellProps) {
  return (
    <View style={[styles.shell, { borderColor: BORDER[state] }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingLeft: 14,
    paddingRight: 12,
    minHeight: 52,
  },
})
