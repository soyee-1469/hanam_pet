import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Type, TypeStyle } from '../../constants/Typography'

type ButtonProps = {
  label: string
  onPress: () => void
  /** disabled여도 탭 시 안내 등 */
  onDisabledPress?: () => void
  disabled?: boolean
  style?: ViewStyle
  /** Primary만 — CTA 주목도 강화 */
  emphasized?: boolean
}

export function PrimaryButton({
  label,
  onPress,
  onDisabledPress,
  disabled,
  style,
  emphasized,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled && !onDisabledPress}
      onPress={() => {
        if (disabled) {
          onDisabledPress?.()
          return
        }
        onPress()
      }}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        pressed && !disabled && styles.pressed,
        disabled && styles.disabledWrap,
        style,
      ]}
    >
      <View
        style={[
          styles.primaryInner,
          emphasized && styles.primaryEmphasized,
          disabled && styles.primaryDisabled,
        ]}
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

/** Outline / ghost — 보조 CTA 위계용 */
export function GhostButton({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        pressed && !disabled && styles.ghostPressed,
        disabled && styles.disabledWrap,
        style,
      ]}
    >
      <View
        style={[styles.ghostInner, disabled && styles.ghostDisabled]}
        collapsable={false}
      >
        <Text style={[styles.ghostText, disabled && styles.ghostTextDisabled]}>
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
  ghostPressed: {
    opacity: 0.7,
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
  primaryEmphasized: {
    height: 56,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    ...TypeStyle.button,
    color: Colors.buttonPrimaryText,
  },
  primaryTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  secondaryInner: {
    height: 54,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondaryBg,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryDisabled: {
    backgroundColor: Colors.sand,
    borderColor: Colors.border,
  },
  secondaryText: {
    ...TypeStyle.button,
    color: Colors.buttonSecondaryText,
  },
  secondaryTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  ghostInner: {
    height: 48,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostDisabled: {
    borderColor: Colors.sand,
  },
  ghostText: {
    fontSize: Type.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  ghostTextDisabled: {
    color: Colors.buttonDisabledText,
  },
})
