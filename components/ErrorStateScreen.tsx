import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Warning } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from './ui'

export type ErrorStateScreenProps = {
  headerTitle?: string
  title: string
  body: string
  primaryLabel: string
  onPrimary: () => void
  tertiaryLabel?: string
  onTertiary?: () => void
  onBack?: () => void
}

/**
 * 오류·실패 안내 풀스크린.
 * Header + 경고 아이콘 + 본문 + Primary(코랄) + Tertiary(텍스트)
 */
export function ErrorStateScreen({
  headerTitle = '안내',
  title,
  body,
  primaryLabel,
  onPrimary,
  tertiaryLabel,
  onTertiary,
  onBack,
}: ErrorStateScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={headerTitle} onBack={onBack} />

      <View style={styles.body}>
        <Warning size={56} color={Colors.cocoa} weight="regular" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{body}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={primaryLabel} emphasized onPress={onPrimary} />
        {tertiaryLabel && onTertiary ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tertiaryLabel}
            onPress={onTertiary}
            hitSlop={8}
            style={({ pressed }) => [
              styles.tertiaryBtn,
              pressed && styles.tertiaryPressed,
            ]}
          >
            <Text style={styles.tertiaryText}>{tertiaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 24,
  },
  title: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.cocoa,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  sub: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.cocoa,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 300,
    opacity: 0.85,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 8,
  },
  tertiaryBtn: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tertiaryPressed: {
    opacity: 0.7,
  },
  tertiaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
})
