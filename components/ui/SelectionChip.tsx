import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native'
import { Colors } from '../../constants/Colors'
import { Type } from '../../constants/Typography'

type SelectionChipProps = {
  label: string
  selected: boolean
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

/**
 * 옵션/필터 칩 — 선택 = cocoa, 미선택 = unselected/border
 * Primary 코랄 사용 금지
 */
export function SelectionChip({
  label,
  selected,
  onPress,
  disabled,
  style,
}: SelectionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipOn : styles.chipOff,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          selected && styles.textOn,
          disabled && styles.textDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.unselected,
  },
  chipOn: {
    backgroundColor: Colors.cocoa,
    borderColor: Colors.cocoa,
  },
  chipDisabled: {
    backgroundColor: Colors.inactive,
    borderColor: Colors.inactive,
  },
  text: {
    fontSize: Type.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  textOn: {
    color: Colors.surface,
  },
  textDisabled: {
    color: Colors.inactiveText,
  },
  pressed: {
    opacity: 0.88,
  },
})
