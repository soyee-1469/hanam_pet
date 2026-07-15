import { useState } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../../constants/Colors'
import { CheckRow, PrimaryButton, ProgressDots, ScreenHeader } from '../../components/ui'
import { ONBOARDING_STEPS, getOnboardingDraft, resetOnboardingDraft } from '../../lib/onboardingDraft'
import { completeOnboarding } from '../../lib/onboardingStorage'

export default function OnboardingAiNotice() {
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)

  const finish = async () => {
    if (!agreed || busy) return
    const draft = getOnboardingDraft()
    if (!draft.nickname || !draft.petId) {
      router.replace('/onboarding/profile')
      return
    }
    setBusy(true)
    try {
      await completeOnboarding({
        nickname: draft.nickname,
        petId: draft.petId,
      })
      resetOnboardingDraft()
      router.replace('/(tabs)')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="AI 안내" onBack={() => router.back()} />
      <ProgressDots total={ONBOARDING_STEPS} index={4} />

      <View style={styles.body}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/dog-character_4.png')}
            style={styles.pet}
            resizeMode="contain"
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>나도 AI의 도움을 받아 이야기해.</Text>
          </View>
        </View>

        <Text style={styles.headline}>AI 상담 전에 알아두세요</Text>

        <View style={styles.card}>
          <Text style={styles.bullet}>
            · 펫 대화는 위로와 일상을 위한 참고용이에요.
          </Text>
          <Text style={styles.bullet}>
            · 위기·응급 상황에는 전문 기관·가까운 사람을 먼저 찾아 주세요.
          </Text>
          <Text style={styles.bullet}>
            · 개인 민감정보는 가능한 한 적게 남겨 주세요.
          </Text>
        </View>

        <CheckRow
          label="내용을 확인했어요"
          checked={agreed}
          onToggle={() => setAgreed((v) => !v)}
          emphasize
        />
      </View>

      <View style={styles.footer}>
        {busy ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : (
          <PrimaryButton
            label="시작하기"
            disabled={!agreed}
            onPress={() => {
              void finish()
            }}
          />
        )}
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
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pet: {
    width: 112,
    height: 112,
  },
  bubble: {
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  loader: {
    height: 54,
  },
})
