import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  type TextInput as RNTextInput,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretDown,
  CaretRight,
  CaretUp,
  DeviceMobile,
  Images,
  Lock,
  Notebook,
  Question,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { onboardingMascot } from '../../constants/OnboardingMascot'
import { PrimaryButton, ScreenHeader } from '../../components/ui'
import { BottomSheet } from '../../components/ui/AppOverlay'
import { NumberKeypad } from '../../components/NumberKeypad'
import { markOnboardingCompleted } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { NumberKeyboardProps } from '../../lib/inputKeyboard'

const copy = getOnboardingCopy().resume
const DEMO_RESTORE_CODE = getOnboardingCopy().restoreCode.dummyCode
const CODE_LEN = 8
/** 더미 복구에도 로딩이 보이도록 */
const RESTORE_DELAY_MS = 1400

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

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
          <View
            key={i}
            style={[
              styles.otpCellWrap,
              isActive && styles.otpCellOn,
              digit !== '' && !isActive && styles.otpCellFilled,
            ]}
          >
            <TextInput
              ref={(el) => {
                inputs.current[i] = el
              }}
              {...NumberKeyboardProps}
              showSoftInputOnFocus={false}
              caretHidden={false}
              value={digit}
              onChangeText={(t) => onChange(i, t)}
              onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
              onFocus={() => onFocus(i)}
              maxLength={i === 0 ? CODE_LEN : 1}
              selectTextOnFocus
              textContentType="oneTimeCode"
              style={styles.otpCell}
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
  const [codeError, setCodeError] = useState(false)
  const [tipOpen, setTipOpen] = useState(true)
  const inputs = useRef<(RNTextInput | null)[]>([])
  const scrollRef = useRef<ScrollView>(null)

  const scrollOtpIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80)
  }, [])

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
    setCodeError(false)
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

  const pressDigit = (digit: string) => {
    if (busy) return
    let index = focused
    if (digits[index] !== '' && index < CODE_LEN - 1) {
      index = Math.min(CODE_LEN - 1, index + 1)
    }
    setDigitAt(index, digit)
  }

  const pressBackspace = () => {
    onKeyPress(focused, 'Backspace')
  }

  const submitCode = async () => {
    if (!codeOk || busy) return
    setBusy(true)
    setCodeError(false)
    inputs.current.forEach((el) => el?.blur())
    try {
      await new Promise((r) => setTimeout(r, RESTORE_DELAY_MS))
      if (code !== DEMO_RESTORE_CODE) {
        setCodeError(true)
        return
      }
      await markOnboardingCompleted()
      setStep('restored')
    } finally {
      setBusy(false)
    }
  }

  const pressNext = () => {
    if (codeOk) {
      void submitCode()
      return
    }
    const empty = digits.findIndex((d) => d === '')
    focusAt(empty >= 0 ? empty : CODE_LEN - 1)
  }

  if (step === 'lost' || step === 'giveUp') {
    const g = copy.lost.giveUp
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
                  <View style={styles.lostTipCard}>
                    <View style={styles.lostTipVisual}>
                      {meta ? (
                        <Image
                          source={meta.image}
                          style={styles.lostTipPet}
                          resizeMode="contain"
                        />
                      ) : null}
                      <View style={styles.lostTipIconBadge}>
                        <TipIcon
                          size={18}
                          color={Colors.textSecondary}
                          weight="duotone"
                        />
                      </View>
                    </View>
                    <View style={styles.lostTipCopy}>
                      <Text style={styles.lostTipTitle}>{tip.title}</Text>
                      <Text style={styles.lostTipBody}>{tip.body}</Text>
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

        <BottomSheet
          visible={step === 'giveUp'}
          onRequestClose={() => setStep('lost')}
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

          <View style={styles.giveUpActions}>
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
        </BottomSheet>
      </SafeAreaView>
    )
  }

  if (step === 'restored') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <View style={styles.restoredGlow}>
            <Image
              source={onboardingMascot(0, 'wink')}
              style={styles.pet}
              resizeMode="contain"
            />
          </View>
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
      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
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
              onFocus={(i) => {
                setFocused(i)
                scrollOtpIntoView()
              }}
            />
            <View style={styles.otpGap} />
            <OtpGroup
              start={4}
              digits={digits}
              focused={focused}
              inputs={inputs}
              onChange={setDigitAt}
              onKeyPress={onKeyPress}
              onFocus={(i) => {
                setFocused(i)
                scrollOtpIntoView()
              }}
            />
          </View>

          {codeError ? (
            <Text style={styles.codeError}>{copy.code.wrongCode}</Text>
          ) : null}

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
          </Pressable>

          <View style={styles.codeTipCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: tipOpen }}
              accessibilityLabel={copy.code.tipTitle}
              disabled={busy}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                )
                setTipOpen((v) => !v)
              }}
              style={({ pressed }) => [
                styles.codeTipHeader,
                pressed && styles.codeTipHeaderPressed,
              ]}
            >
              <View style={styles.codeTipIcon}>
                <Question size={16} color={Colors.selected} weight="bold" />
              </View>
              <Text style={styles.codeTipTitle}>{copy.code.tipTitle}</Text>
              {tipOpen ? (
                <CaretUp size={16} color={Colors.textPrimary} weight="bold" />
              ) : (
                <CaretDown size={16} color={Colors.textPrimary} weight="bold" />
              )}
            </Pressable>
            {tipOpen ? (
              <View style={styles.codeTipBodyWrap}>
                <Text style={styles.codeTipIntro}>{copy.code.tipIntro}</Text>
                {copy.code.tipItems.map((item) => (
                  <View key={item} style={styles.codeTipItemRow}>
                    <Text style={styles.codeTipBullet}>·</Text>
                    <Text style={styles.codeTipItem}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>

        {busy ? (
          <View style={styles.footer}>
            <PrimaryButton
              label={copy.code.cta}
              disabled
              emphasized={false}
              onPress={() => {}}
            />
          </View>
        ) : (
          <NumberKeypad
            onDigit={pressDigit}
            onBackspace={pressBackspace}
            onNext={pressNext}
            nextLabel="다음"
            nextDisabled={false}
          />
        )}
      </View>

      {busy ? (
        <View style={styles.checkingOverlay} pointerEvents="auto">
          <View style={styles.checkingCard}>
            <View style={styles.checkingHero}>
              <Image
                source={DogExpr.soft}
                style={styles.checkingPet}
                resizeMode="contain"
              />
              <View style={styles.checkingBook}>
                <Notebook size={20} color={Colors.selected} weight="fill" />
              </View>
            </View>
            <Text style={styles.checkingText}>{copy.code.loadingMessage}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
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
    paddingBottom: Layout.sectionGapLg,
    flexGrow: 1,
  },
  lostBody: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
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
  },
  restoredGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lostPet: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 22,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  otpGap: {
    width: 8,
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
  codeError: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceSecondary,
  },
  helpBtnPressed: {
    opacity: 0.85,
  },
  helpBtnDisabled: {
    opacity: 0.5,
  },
  helpBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  /** 기록 가져오기 — 번호 확인 아코디언 */
  codeTipCard: {
    marginTop: 'auto' as const,
    paddingTop: 8,
    paddingBottom: 4,
  },
  codeTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  codeTipHeaderPressed: {
    opacity: 0.85,
  },
  codeTipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeTipTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  codeTipBodyWrap: {
    paddingLeft: 4,
    paddingBottom: 4,
    gap: 6,
  },
  codeTipIntro: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  codeTipItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  codeTipBullet: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  codeTipItem: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  codeTipBody: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  otpCellWrap: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 28,
    maxWidth: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  otpCell: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 18,
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
  tipList: {
    gap: 12,
    marginBottom: 8,
  },
  lostTipCard: {
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
  lostTipVisual: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostTipPet: {
    width: 56,
    height: 56,
  },
  lostTipIconBadge: {
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
  lostTipCopy: {
    flex: 1,
    minWidth: 0,
  },
  lostTipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  lostTipBody: {
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
    paddingHorizontal: Layout.cardPaddingH,
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
  checkingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(48, 36, 28, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    paddingHorizontal: Layout.screenPaddingH,
  },
  checkingCard: {
    alignItems: 'center',
    gap: 16,
  },
  checkingHero: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkingPet: {
    width: 120,
    height: 120,
  },
  checkingBook: {
    position: 'absolute',
    right: 8,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkingText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.blockGap,
    paddingTop: Layout.sectionGap,
    backgroundColor: Colors.creamyBeige,
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
  giveUpTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 30,
    textAlign: 'center',
  },
  giveUpCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: Layout.blockGap,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: 20,
  },
  giveUpPrivacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  giveUpPrivacyTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  giveUpPrivacyBody: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  giveUpPrivacyGap: {
    marginBottom: 12,
  },
  giveUpPrivacyBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  giveUpActions: {
    gap: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
