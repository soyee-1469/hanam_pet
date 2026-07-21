import type { ReactNode } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'

type Props = {
  title: string
  body?: string
  /** 에셋 아이콘 */
  icon?: ImageSourcePropType
  /** 에셋 대신 커스텀 아이콘 */
  iconNode?: ReactNode
  ctaLabel?: string
  onPressCta?: () => void
  ctaAccessibilityLabel?: string
}

/** 기록·히스토리 빈 상태 — 검사결과/일기/보관함 공통 */
export function EmptyRecordsCard({
  title,
  body,
  icon,
  iconNode,
  ctaLabel,
  onPressCta,
  ctaAccessibilityLabel,
}: Props) {
  return (
    <View style={styles.card}>
      {icon ? (
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      ) : iconNode ? (
        <View style={styles.iconNode}>{iconNode}</View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {ctaLabel && onPressCta ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ctaAccessibilityLabel ?? ctaLabel}
          onPress={onPressCta}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 40,
    paddingHorizontal: Layout.screenPaddingH,
    alignItems: 'center',
    ...Shadows.elevation,
  },
  icon: {
    width: 88,
    height: 88,
    marginBottom: 18,
  },
  iconNode: {
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
})
