import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../../constants/Colors'
import { PrimaryButton, SecondaryButton, ScreenHeader } from '../../components/ui'
import { markOnboardingCompleted } from '../../lib/onboardingStorage'

type Step = 'code' | 'lost' | 'restored'

export default function OnboardingResume() {
  const [step, setStep] = useState<Step>('code')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const codeOk = code.trim().length >= 6

  const submitCode = async () => {
    if (!codeOk || busy) return
    setBusy(true)
    try {
      // Dummy restore — any 6+ char code works
      await markOnboardingCompleted()
      setStep('restored')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'lost') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="이어보기" onBack={() => setStep('code')} />
        <View style={styles.body}>
          <Text style={styles.headline}>번호를 잊으셨나요?</Text>
          <Text style={styles.sub}>
            서버 연동 전이라 지금은 복구 코드를 다시 찾을 수 없어요.
            {'\n'}새로 시작하거나, 코드를 기억나시면 입력해 주세요.
          </Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              나중에 계정 연동이 되면 이메일·휴대폰으로 이어볼 수 있게 될 거예요.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="코드 다시 입력" onPress={() => setStep('code')} />
          <View style={styles.gap} />
          <SecondaryButton
            label="처음부터 시작"
            onPress={() => router.replace('/onboarding/intro')}
          />
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'restored') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Image
            source={require('../../assets/images/dog-character_5.png')}
            style={styles.pet}
            resizeMode="contain"
          />
          <Text style={[styles.headline, styles.centerText]}>다시 만났어요</Text>
          <Text style={[styles.sub, styles.centerText]}>이어서 함께해요.</Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="홈으로" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="이어보기" onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.headline}>이어보기 번호</Text>
          <Text style={styles.sub}>
            이전에 받은 6자리 이상 코드를 입력해 주세요. (더미)
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="예: HP-ABC123"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              void submitCode()
            }}
          />
          <SecondaryButton
            label="번호를 잊었어요"
            onPress={() => setStep('lost')}
            style={styles.lostBtn}
          />
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label={busy ? '확인 중…' : '이어하기'}
            disabled={!codeOk || busy}
            onPress={() => {
              void submitCode()
            }}
          />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  centerText: {
    textAlign: 'center',
  },
  pet: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  lostBtn: {
    marginTop: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  gap: {
    height: 10,
  },
})
