import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import {
  CheckRow,
  PrimaryButton,
  ProgressDots,
  ScreenHeader,
} from '../../components/ui'
import { ONBOARDING_STEPS } from '../../lib/onboardingDraft'

type TermKey = 'service' | 'privacy' | 'age' | 'ai' | 'marketing'

const TERMS: {
  key: TermKey
  label: string
  required: boolean
}[] = [
  { key: 'service', label: '서비스 이용약관 동의', required: true },
  { key: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { key: 'age', label: '만 14세 이상입니다', required: true },
  { key: 'ai', label: 'AI 상담 유의사항 확인', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 (선택)', required: false },
]

export default function OnboardingTerms() {
  const [checks, setChecks] = useState<Record<TermKey, boolean>>({
    service: false,
    privacy: false,
    age: false,
    ai: false,
    marketing: false,
  })

  const requiredKeys = useMemo(
    () => TERMS.filter((t) => t.required).map((t) => t.key),
    [],
  )
  const allRequired = requiredKeys.every((k) => checks[k])
  const allChecked = TERMS.every((t) => checks[t.key])

  const toggle = (key: TermKey) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = () => {
    const next = !allChecked
    setChecks({
      service: next,
      privacy: next,
      age: next,
      ai: next,
      marketing: next,
    })
  }

  const showTerm = (label: string) => {
    Alert.alert(label, '약관 전문은 Phase 2에서 연결됩니다. (더미)')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="약관 동의" onBack={() => router.back()} />
      <ProgressDots total={ONBOARDING_STEPS} index={1} />

      <View style={styles.body}>
        <Text style={styles.headline}>시작하기 전에</Text>
        <Text style={styles.sub}>
          필수 항목만 동의하면 바로 이어갈 수 있어요.
        </Text>

        <View style={styles.card}>
          <CheckRow
            label="전체 동의"
            checked={allChecked}
            onToggle={toggleAll}
            emphasize
          />
          {TERMS.map((t) => (
            <CheckRow
              key={t.key}
              label={`${t.required ? '(필수) ' : '(선택) '}${t.label}`}
              checked={checks[t.key]}
              onToggle={() => toggle(t.key)}
              onPressLink={
                t.key === 'age' ? undefined : () => showTerm(t.label)
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="다음"
          disabled={!allRequired}
          onPress={() => router.push('/onboarding/profile')}
        />
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
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
})
