import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretRight, Check } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

type CheckRowProps = {
  label: string
  checked: boolean
  onToggle: () => void
  /** 우측 화살표만 — 약관 상세 */
  onPressDetail?: () => void
  badge?: 'required' | 'optional'
  emphasize?: boolean
  compact?: boolean
  hint?: string
}

export function CheckRow({
  label,
  checked,
  onToggle,
  onPressDetail,
  badge,
  emphasize,
  compact,
  hint,
}: CheckRowProps) {
  return (
    <View
      style={[
        styles.row,
        emphasize && styles.rowEmphasize,
        compact && styles.rowCompact,
      ]}
      collapsable={false}
    >
      {/* 체크 + 라벨 = 토글 (행 대부분) */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggle}
        android_ripple={{ color: 'transparent' }}
        style={({ pressed }) => [
          styles.mainHit,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.checkHit} collapsable={false}>
          <View
            style={[styles.box, checked && styles.boxOn]}
            collapsable={false}
          >
            {checked ? (
              <Check size={11} color={Colors.buttonPrimaryText} weight="bold" />
            ) : null}
          </View>
        </View>

        <View style={styles.labelBlock}>
          <View style={styles.labelRow}>
            {badge ? (
              <View
                style={[
                  styles.badge,
                  badge === 'required'
                    ? styles.badgeRequired
                    : styles.badgeOptional,
                ]}
                collapsable={false}
              >
                <Text
                  style={[
                    styles.badgeText,
                    badge === 'required'
                      ? styles.badgeTextRequired
                      : styles.badgeTextOptional,
                  ]}
                >
                  {badge === 'required' ? '필수' : '선택'}
                </Text>
              </View>
            ) : null}
            <Text
              style={[
                styles.label,
                emphasize && styles.labelEmphasize,
                badge === 'optional' && styles.labelOptional,
              ]}
              numberOfLines={2}
            >
              {label}
            </Text>
          </View>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      </Pressable>

      {onPressDetail ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} 상세 보기`}
          onPress={onPressDetail}
          hitSlop={4}
          android_ripple={{ color: 'transparent' }}
          style={({ pressed }) => [
            styles.chevronHit,
            pressed && styles.pressed,
          ]}
        >
          <CaretRight size={18} color={Colors.textDisabled} weight="bold" />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  rowCompact: {
    minHeight: 44,
  },
  rowEmphasize: {
    paddingVertical: 2,
  },
  mainHit: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkHit: {
    width: 36,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 999,
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
  labelBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeRequired: {
    backgroundColor: Colors.primary,
  },
  badgeOptional: {
    backgroundColor: Colors.sand,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextRequired: {
    color: Colors.buttonPrimaryText,
  },
  badgeTextOptional: {
    color: Colors.textDisabled,
  },
  label: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  labelEmphasize: {
    fontSize: 15,
    fontWeight: '800',
  },
  labelOptional: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  hint: {
    marginTop: 2,
    marginLeft: 0,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  chevronHit: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pressed: {
    opacity: 0.78,
  },
})
