import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Check } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../components/ui'
import { resetOnboardingCompleted } from '../lib/onboardingStorage'
import { resetOnboardingDraft } from '../lib/onboardingDraft'

const DELETE_ITEMS = [
  '대화 기록이 모두 사라져요',
  '소중히 적어둔 마음일기가 모두 사라져요',
  '내 감정을 돌아본 마음 살핌 기록이 모두 사라져요',
  '기록을 이어주는 번호가 즉시 사라져요',
] as const

export default function WithdrawScreen() {
  const [busy, setBusy] = useState(false)

  const stay = () => {
    if (busy) return
    router.back()
  }

  const withdraw = async () => {
    if (busy) return
    setBusy(true)
    try {
      await resetOnboardingCompleted()
      resetOnboardingDraft()
      router.replace('/withdraw-done')
    } catch {
      Alert.alert('탈퇴 실패', '잠시 후 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="회원탈퇴" onBack={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.headline}>정말 하남이와 헤어지시겠어요?</Text>
          <Text style={styles.sub}>
            탈퇴하시면 하남이와 함께한 모든 추억이 지워져요. 탈퇴 후에는 이전
            기록들을 다시 불러올 수 없어요.
          </Text>
        </View>

        <View style={styles.card}>
          {DELETE_ITEMS.map((item) => (
            <View key={item} style={styles.itemRow}>
              <Check size={18} color={Colors.primary} weight="bold" />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="하남이 곁에 남을래요"
          emphasized
          disabled={busy}
          onPress={stay}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="하남이와 헤어질래요"
          disabled={busy}
          onPress={() => {
            void withdraw()
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.leaveLink,
            pressed && styles.leaveLinkPressed,
            busy && styles.leaveLinkDisabled,
          ]}
        >
          <Text style={styles.leaveLinkText}>하남이와 헤어질래요</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 28,
    paddingBottom: Layout.blockGap,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 20,
    gap: 16,
    ...Shadows.elevation,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 4,
    paddingBottom: 8,
  },
  leaveLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  leaveLinkPressed: {
    opacity: 0.7,
  },
  leaveLinkDisabled: {
    opacity: 0.45,
  },
  leaveLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
