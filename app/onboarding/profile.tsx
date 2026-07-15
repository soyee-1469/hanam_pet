import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { PrimaryButton, ProgressDots, ScreenHeader } from '../../components/ui'
import { ONBOARDING_STEPS, getOnboardingDraft, setOnboardingDraft } from '../../lib/onboardingDraft'

export default function OnboardingProfile() {
  const [nickname, setNickname] = useState(getOnboardingDraft().nickname)

  const trimmed = nickname.trim()
  const valid = trimmed.length >= 2 && trimmed.length <= 10

  const goNext = () => {
    if (!valid) return
    setOnboardingDraft({ nickname: trimmed })
    router.push('/onboarding/pet-select')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="내 정보" onBack={() => router.back()} />
      <ProgressDots total={ONBOARDING_STEPS} index={2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.headline}>어떻게 불러드릴까요?</Text>
          <Text style={styles.sub}>닉네임은 나중에 설정에서 바꿀 수 있어요.</Text>

          <Text style={styles.label}>닉네임</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="2~10자"
            placeholderTextColor={Colors.textDisabled}
            maxLength={10}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={goNext}
          />
          <Text style={styles.hint}>
            {trimmed.length}/10
            {trimmed.length > 0 && !valid ? '  ·  2자 이상 입력해 주세요' : ''}
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="다음" disabled={!valid} onPress={goNext} />
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
})
