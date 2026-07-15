import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Check } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

type CheckRowProps = {
  label: string
  checked: boolean
  onToggle: () => void
  onPressLink?: () => void
  linkLabel?: string
  emphasize?: boolean
}

export function CheckRow({
  label,
  checked,
  onToggle,
  onPressLink,
  linkLabel = '보기',
  emphasize,
}: CheckRowProps) {
  return (
    <View style={[styles.row, emphasize && styles.rowEmphasize]} collapsable={false}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        hitSlop={6}
        onPress={onToggle}
        android_ripple={{ color: 'transparent' }}
        style={styles.checkHit}
      >
        <View
          style={[styles.box, checked && styles.boxOn]}
          collapsable={false}
        >
          {checked ? (
            <Check size={14} color={Colors.buttonPrimaryText} weight="bold" />
          ) : null}
        </View>
      </Pressable>
      <Text style={[styles.label, emphasize && styles.labelEmphasize]}>{label}</Text>
      {onPressLink ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressLink}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowEmphasize: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  checkHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.taupe,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  label: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  labelEmphasize: {
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.75,
  },
})
