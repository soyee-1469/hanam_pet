import type { ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretLeft } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout, HeaderTitleStyle } from '../../constants/Layout'
import { TypeStyle } from '../../constants/Typography'

type ScreenHeaderProps = {
  title?: string
  onBack?: () => void
  /** 우측 건너뛰기 — 서비스 소개 투어 등 */
  onSkip?: () => void
  skipLabel?: string
  right?: ReactNode
}

export function ScreenHeader({
  title,
  onBack,
  onSkip,
  skipLabel = '건너뛰기',
  right,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={onBack}
          android_ripple={{ color: 'transparent' }}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
      ) : (
        <View style={styles.sideSlot} />
      )}
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.titleSpacer} />
      )}
      {right != null ? (
        <View style={styles.sideSlot}>{right}</View>
      ) : onSkip ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={skipLabel}
          hitSlop={8}
          onPress={onSkip}
          style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
        >
          <Text style={styles.skipText}>{skipLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.sideSlot} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
    backgroundColor: Colors.background,
    zIndex: 10,
    flexShrink: 0,
  },
  sideBtn: {
    width: 72,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSlot: {
    width: 72,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 72,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    ...TypeStyle.bodySecondary,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    ...HeaderTitleStyle.screen,
  },
  titleSpacer: {
    flex: 1,
  },
})
