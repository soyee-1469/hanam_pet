import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { FirstAid } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'

type HelpSosFabProps = {
  onPress: () => void
  /** absolute bottom inset (composer·탭바 위) */
  bottom: number
  style?: StyleProp<ViewStyle>
}

/**
 * 대화 등 — 긴급 상담(SOS) 플로팅 버튼.
 * 위기·도움용이라 Primary 코랄 금지 → surface + selected.
 */
export function HelpSosFab({ onPress, bottom, style }: HelpSosFabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="SOS 긴급 상담"
      accessibilityHint="전문 상담 기관 연락처를 엽니다"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.fab,
        { bottom },
        pressed && styles.pressed,
        style,
      ]}
    >
      <FirstAid size={20} color={Colors.selected} weight="fill" />
      <Text style={styles.label}>SOS</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
    elevation: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    ...Shadows.elevation,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.selected,
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
})
