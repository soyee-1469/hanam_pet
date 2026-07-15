import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native'
import { Colors, Shadows } from '../../constants/Colors'

type ButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export function PrimaryButton({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        pressed && !disabled && styles.pressed,
        disabled && styles.disabledWrap,
        style,
      ]}
    >
      <View
        style={[styles.primaryInner, disabled && styles.primaryDisabled]}
        collapsable={false}
      >
        <Text style={[styles.primaryText, disabled && styles.primaryTextDisabled]}>
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

export function SecondaryButton({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        pressed && !disabled && styles.pressed,
        disabled && styles.disabledWrap,
        style,
      ]}
    >
      <View
        style={[styles.secondaryInner, disabled && styles.secondaryDisabled]}
        collapsable={false}
      >
        <Text
          style={[styles.secondaryText, disabled && styles.secondaryTextDisabled]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  disabledWrap: {
    opacity: 1,
  },
  primaryInner: {
    height: 54,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonPrimaryBg,
    ...Shadows.elevation,
  },
  primaryDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
  primaryTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  secondaryInner: {
    height: 54,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  secondaryDisabled: {
    backgroundColor: Colors.sand,
    borderColor: Colors.border,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.buttonSecondaryText,
  },
  secondaryTextDisabled: {
    color: Colors.buttonDisabledText,
  },
})
