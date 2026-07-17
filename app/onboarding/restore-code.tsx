import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Copy } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { DogExpr } from '../../constants/DogExpr'
import {
  PrimaryButton,
  ProgressDots,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import { ONBOARDING_STEPS, getOnboardingDraft } from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().restoreCode

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.wink,
  nami: require('../../assets/images/cat-character_1.png'),
}

const SAVE_NAV_DELAY_MS = 900

export default function OnboardingRestoreCode() {
  const draft = getOnboardingDraft()
  const petId: PetChoice = draft.petId ?? 'mongi'

  const [toastVisible, setToastVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  /** 4/5 → 저장 직후 5번째 하트까지 채운 뒤 팝 */
  const [progressIndex, setProgressIndex] = useState(3)
  const [popLast, setPopLast] = useState(false)

  const toastOpacity = useRef(new Animated.Value(0)).current
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didNavigate = useRef(false)

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (navTimer.current) clearTimeout(navTimer.current)
    }
  }, [])

  const showCopiedToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastVisible(true)
    toastOpacity.setValue(0)
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setToastVisible(false)
      })
    }, 1800)
  }

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(copy.dummyCode)
    } catch {
      // ignore clipboard failures
    }
    showCopiedToast()
  }

  const goWelcome = useCallback(() => {
    if (didNavigate.current) return
    didNavigate.current = true
    if (navTimer.current) {
      clearTimeout(navTimer.current)
      navTimer.current = null
    }
    router.push('/onboarding/welcome')
  }, [])

  const saveAndCelebrate = async () => {
    if (saving) return
    if (!draft.nickname || !draft.petId) {
      router.replace('/onboarding/profile')
      return
    }

    setSaving(true)
    try {
      await Clipboard.setStringAsync(copy.dummyCode)
    } catch {
      // ignore
    }

    // 마지막 하트 채우기 + 팝 → 환영 화면
    setProgressIndex(4)
    setPopLast(true)

    // 하트 팝이 끝나지 않아도 일정 시간 후 반드시 이동
    navTimer.current = setTimeout(() => {
      goWelcome()
    }, SAVE_NAV_DELAY_MS)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={copy.header}
        onBack={saving ? undefined : () => router.back()}
      />

      {saving ? (
        <View style={styles.savingBody}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.savingText}>{copy.savingMessage}</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.headline}>{copy.headline}</Text>
          <Text style={styles.sub}>{copy.body}</Text>

          <View style={styles.codeBlock}>
            <Image
              source={PET_IMAGES[petId]}
              style={styles.peekPet}
              resizeMode="contain"
              accessibilityLabel="선택한 펫"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="번호 복사"
              onPress={() => {
                void copyCode()
              }}
              style={({ pressed }) => [
                styles.codeCard,
                pressed && styles.codePressed,
              ]}
            >
              <Text style={styles.codeLabel}>{copy.codeLabel}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeValue}>
                  {`${copy.dummyCode.slice(0, 4)} ${copy.dummyCode.slice(4)}`}
                </Text>
                <View style={styles.copyIconWrap}>
                  <Copy size={18} color={Colors.textSecondary} weight="bold" />
                </View>
              </View>
            </Pressable>
          </View>

          <Text style={styles.tip}>{copy.tip}</Text>
        </View>
      )}

      {toastVisible && !saving ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <Text style={styles.toastText}>{copy.copiedToast}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.footer}>
        <ProgressDots
          total={ONBOARDING_STEPS}
          index={progressIndex}
          popLast={popLast}
          onPopComplete={goWelcome}
        />
        {saving ? (
          <View style={styles.savingCta}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.savingCtaText}>{copy.ctaBusy}</Text>
          </View>
        ) : (
          <PrimaryButton
            label={copy.cta}
            emphasized
            onPress={() => {
              void saveAndCelebrate()
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
    paddingTop: 0,
  },
  savingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 18,
  },
  savingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 32,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  codeBlock: {
    alignItems: 'center',
    overflow: 'visible',
    marginTop: 4,
  },
  peekPet: {
    width: 96,
    height: 96,
    marginBottom: -36,
    zIndex: 2,
  },
  codeCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 1,
    ...Shadows.elevation,
  },
  codePressed: {
    opacity: 0.92,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeValue: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  copyIconWrap: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#555555',
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.surface,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  savingCta: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  savingCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
})
