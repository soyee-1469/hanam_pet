import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  type TextInput as RNTextInput,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretRight,
  DeviceMobile,
  Images,
  Lock,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { onboardingMascot } from '../../constants/OnboardingMascot'
import { PrimaryButton, ScreenHeader } from '../../components/ui'
import { markOnboardingCompleted } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().resume
const CODE_LEN = 8
/** 더미 복구에도 로딩이 보이도록 */
const RESTORE_DELAY_MS = 1400

type Step = 'code' | 'lost' | 'giveUp' | 'restored'

const TIP_META: Record<
  string,
  { Icon: Icon; image: ImageSourcePropType }
> = {
  gallery: {
    Icon: Images,
    image: onboardingMascot(0, 'wink'),
  },
  device: {
    Icon: DeviceMobile,
    image: onboardingMascot(1, 'soft'),
  },
}

function OtpGroup({
  start,
  digits,
  focused,
  inputs,
  onChange,
  onKeyPress,
  onFocus,
}: {
  start: number
  digits: string[]
  focused: number
  inputs: MutableRefObject<(RNTextInput | null)[]>
  onChange: (index: number, raw: string) => void
  onKeyPress: (index: number, key: string) => void
  onFocus: (index: number) => void
}) {
  return (
    <View style={styles.otpGroup}>
      {digits.slice(start, start + 4).map((digit, offset) => {
        const i = start + offset
        const isActive = focused === i
        return (
          <View key={i} style={styles.otpCellWrap}>
            <TextInput
              ref={(el) => {
                inputs.current[i] = el
              }}
              value={digit}
              onChangeText={(t) => onChange(i, t)}
              onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
              onFocus={() => onFocus(i)}
              keyboardType="number-pad"
              maxLength={i === 0 ? CODE_LEN : 1}
              selectTextOnFocus
              textContentType="oneTimeCode"
              style={[
                styles.otpCell,
                isActive && styles.otpCellOn,
                digit !== '' && !isActive && styles.otpCellFilled,
              ]}
              accessibilityLabel={`${i + 1}번째 자리`}
            />
          </View>
        )
      })}
    </View>
  )
}

export default function OnboardingResume() {
  const [step, setStep] = useState<Step>('code')
  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(''))
  const [focused, setFocused] = useState(0)
  const [busy, setBusy] = useState(false)
  const inputs = useRef<(RNTextInput | null)[]>([])

  const code = digits.join('')
  const codeOk = /^\d{8}$/.test(code)

  useEffect(() => {
    if (step !== 'code' || busy) return
    const t = setTimeout(() => {
      setFocused(0)
      inputs.current[0]?.focus()
    }, 120)
    return () => clearTimeout(t)
  }, [step, busy])

  const focusAt = (index: number) => {
    const i = Math.max(0, Math.min(CODE_LEN - 1, index))
    setFocused(i)
    requestAnimationFrame(() => {
      inputs.current[i]?.focus()
    })
  }

  const setDigitAt = (index: number, raw: string) => {
    if (busy) return
    const cleaned = raw.replace(/\D/g, '')
    if (cleaned.length === 0) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    if (cleaned.length > 1) {
      const next = [...digits]
      const chars = cleaned.slice(0, CODE_LEN - index).split('')
      chars.forEach((ch, i) => {
        next[index + i] = ch
      })
      setDigits(next)
      const filledTo = index + chars.length
      focusAt(filledTo >= CODE_LEN ? CODE_LEN - 1 : filledTo)
      return
    }

    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    if (index < CODE_LEN - 1) {
      focusAt(index + 1)
    }
  }

  const onKeyPress = (index: number, key: string) => {
    if (busy) return
    if (key === 'Backspace') {
      if (digits[index] !== '') {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
        return
      }
      if (index > 0) {
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
        focusAt(index - 1)
      }
    }
  }

  const submitCode = async () => {
    if (!codeOk || busy) return
    setBusy(true)
    inputs.current.forEach((el) => el?.blur())
    try {
      await new Promise((r) => setTimeout(r, RESTORE_DELAY_MS))
      await markOnboardingCompleted()
      setStep('restored')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'lost') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title={copy.header} onBack={() => setStep('code')} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.lostBody}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={onboardingMascot(0, 'soft')}
            style={styles.lostPet}
            resizeMode="contain"
          />
          <Text style={styles.headline}>{copy.lost.headline}</Text>
          <Text style={styles.sub}>{copy.lost.body}</Text>

          <View style={styles.tipList}>
            {copy.lost.tips.map((tip) => {
              const meta = TIP_META[tip.key]
              const TipIcon = meta?.Icon ?? Images
              return (
                <View key={tip.key}>
                  <View style={styles.tipCard}>
                    <View style={styles.tipVisual}>
                      {meta ? (
                        <Image
                          source={meta.image}
                          style={styles.tipPet}
                          resizeMode="contain"
                        />
                      ) : null}
                      <View style={styles.tipIconBadge}>
                        <TipIcon
                          size={18}
                          color={Colors.textSecondary}
                          weight="duotone"
                        />
                      </View>
                    </View>
                    <View style={styles.tipCopy}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipBody}>{tip.body}</Text>
                    </View>
                  </View>
                  {tip.key === 'device' ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setStep('giveUp')}
                      style={({ pressed }) => [
                        styles.cantFindBtn,
                        pressed && styles.cantFindBtnPressed,
                      ]}
                    >
                      <Text style={styles.cantFindBtnText}>
                        {copy.lost.cantFind}
                      </Text>
                      <CaretRight
                        size={18}
                        color={Colors.textSecondary}
                        weight="bold"
                      />
                    </Pressable>
                  ) : null}
                </View>
              )
            })}
          </View>

          <Text style={styles.note}>{copy.lost.note}</Text>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            label={copy.lost.retry}
            emphasized
            onPress={() => setStep('code')}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/onboarding/intro')}
            style={({ pressed }) => [
              styles.restartLink,
              pressed && styles.restartLinkPressed,
            ]}
          >
            <Text style={styles.restartLinkText}>{copy.lost.restart}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'giveUp') {
    const g = copy.lost.giveUp
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title={copy.header} onBack={() => setStep('lost')} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.giveUpBody}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.giveUpTitle}>{g.title}</Text>

          <View style={styles.giveUpCard}>
            <View style={styles.giveUpPrivacyRow}>
              <Lock size={18} color={Colors.cocoa} weight="regular" />
              <Text style={styles.giveUpPrivacyTitle}>{g.privacyTitle}</Text>
            </View>
            {g.privacyParagraphs.map((parts, i) => (
              <Text
                key={i}
                style={[
                  styles.giveUpPrivacyBody,
                  i < g.privacyParagraphs.length - 1 &&
                    styles.giveUpPrivacyGap,
                ]}
              >
                {parts.map((part, j) => (
                  <Text
                    key={j}
                    style={
                      'bold' in part && part.bold
                        ? styles.giveUpPrivacyBold
                        : undefined
                    }
                  >
                    {part.text}
                  </Text>
                ))}
              </Text>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={g.restart}
            emphasized
            onPress={() => router.replace('/onboarding/intro')}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setStep('code')}
            style={({ pressed }) => [
              styles.giveUpLookAgain,
              pressed && styles.giveUpLookAgainPressed,
            ]}
          >
            <Text style={styles.giveUpLookAgainText}>{g.lookAgain}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'restored') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Image
            source={onboardingMascot(0, 'wink')}
            style={styles.pet}
            resizeMode="contain"
          />
          <Text style={[styles.headline, styles.centerText]}>
            {copy.restored.headline}
          </Text>
          <Text style={[styles.sub, styles.centerText]}>{copy.restored.body}</Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label={copy.restored.cta}
            emphasized
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headline}>{copy.code.headline}</Text>
          <Text style={styles.sub}>{copy.code.body}</Text>

          <View style={styles.otpRow} pointerEvents={busy ? 'none' : 'auto'}>
            <OtpGroup
              start={0}
              digits={digits}
              focused={focused}
              inputs={inputs}
              onChange={setDigitAt}
              onKeyPress={onKeyPress}
              onFocus={setFocused}
            />
            <Text style={styles.otpSep}>·</Text>
            <OtpGroup
              start={4}
              digits={digits}
              focused={focused}
              inputs={inputs}
              onChange={setDigitAt}
              onKeyPress={onKeyPress}
              onFocus={setFocused}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => setStep('lost')}
            style={({ pressed }) => [
              styles.helpBtn,
              pressed && styles.helpBtnPressed,
              busy && styles.helpBtnDisabled,
            ]}
          >
            <Text style={styles.helpBtnText}>{copy.code.lostLink}</Text>
            <CaretRight size={18} color={Colors.textSecondary} weight="bold" />
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          {busy ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>{copy.code.loadingMessage}</Text>
            </View>
          ) : (
            <PrimaryButton
              label={copy.code.cta}
              disabled={!codeOk}
              emphasized={codeOk}
              onPress={() => {
                void submitCode()
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 12,
  },
  lostBody: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 20,
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
  lostPet: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginBottom: 8,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 30,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  otpGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  otpSep: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDisabled,
    marginHorizontal: 2,
    marginBottom: 2,
  },
  otpCellWrap: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 28,
    maxWidth: 44,
  },
  otpCell: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    padding: 0,
  },
  otpCellOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  otpCellFilled: {
    borderColor: Colors.beige,
    backgroundColor: Colors.surface,
  },
  helpBtn: {
    marginTop: 22,
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.elevation,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  helpBtnPressed: {
    opacity: 0.85,
  },
  helpBtnDisabled: {
    opacity: 0.5,
  },
  helpBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tipList: {
    gap: 12,
    marginBottom: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tipVisual: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipPet: {
    width: 56,
    height: 56,
  },
  tipIconBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  tipCopy: {
    flex: 1,
    minWidth: 0,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  tipBody: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cantFindBtn: {
    marginTop: 10,
    marginBottom: 8,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cantFindBtnPressed: {
    opacity: 0.85,
    backgroundColor: Colors.surfaceSecondary,
  },
  cantFindBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textDisabled,
    marginBottom: 8,
  },
  loadingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 12,
    minHeight: 72,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  restartLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  restartLinkPressed: {
    opacity: 0.7,
  },
  restartLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  giveUpBody: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 12,
    flexGrow: 1,
  },
  giveUpTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 20,
    lineHeight: 32,
  },
  giveUpCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  giveUpPrivacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  giveUpPrivacyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  giveUpPrivacyBody: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  giveUpPrivacyGap: {
    marginBottom: 16,
  },
  giveUpPrivacyBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  giveUpLookAgain: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  giveUpLookAgainPressed: {
    opacity: 0.7,
  },
  giveUpLookAgainText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
})
