import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretRight } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'

export type SettingsRowVariant = 'link' | 'version' | 'static'

export type SettingsRowProps = {
  title: string
  /** 보조 설명 (한 줄) */
  subtitle?: string
  /** version 행 우측 라벨 등 */
  trailing?: string
  /** link | version(비탭) | static(비탭·캐럿 없음) */
  variant?: SettingsRowVariant
  /** 위험·탈퇴 등 — 제목 색만 error */
  danger?: boolean
  /** 그룹 마지막 행이면 divider 생략 */
  isLast?: boolean
  /** 좌측 아이콘 (이용 안내 등) */
  Icon?: Icon
  onPress?: () => void
  accessibilityLabel?: string
}

/** 설정·내비 리스트 행 — 피그마 SettingsRow */
export function SettingsRow({
  title,
  subtitle,
  trailing,
  variant = 'link',
  danger = false,
  isLast = false,
  Icon,
  onPress,
  accessibilityLabel,
}: SettingsRowProps) {
  const [hovered, setHovered] = useState(false)
  const interactive = variant === 'link' && onPress != null
  const showCaret = variant === 'link'
  const a11y =
    accessibilityLabel ??
    (trailing ? `${title}, ${trailing}` : title)

  const body = (
    <View
      style={[
        styles.row,
        !isLast && styles.rowDivider,
        hovered && interactive && styles.rowHover,
      ]}
    >
      {Icon ? (
        <View style={styles.iconSlot}>
          <Icon
            size={22}
            color={danger ? Colors.error : Colors.textPrimary}
            weight="regular"
          />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text
          style={[styles.title, danger && styles.titleDanger]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text style={styles.trailing} numberOfLines={1}>
          {trailing}
        </Text>
      ) : null}
      {showCaret ? (
        <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
      ) : null}
    </View>
  )

  if (!interactive) {
    return (
      <View accessibilityRole="text" accessibilityLabel={a11y}>
        {body}
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.rowMinHeight,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    gap: 10,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowHover: {
    backgroundColor: Colors.surfaceSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
  iconSlot: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  titleDanger: {
    color: Colors.error,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  trailing: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
