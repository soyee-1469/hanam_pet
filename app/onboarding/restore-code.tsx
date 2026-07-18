import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
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
import { PhotoPermissionSheet } from '../../components/PhotoPermissionSheet'
import { PhotoPermissionDeniedDialog } from '../../components/PhotoPermissionDeniedDialog'
import { ONBOARDING_STEPS, getOnboardingDraft } from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { showToast } from '../../lib/toast'

const copy = getOnboardingCopy().restoreCode

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.wink,
  nami: require('../../assets/images/cat-character_1.png'),
}

const SAVE_NAV_DELAY_MS = 900

export default function OnboardingRestoreCode() {
  const draft = getOnboardingDraft()
  const petId: PetChoice = draft.petId ?? 'mongi'

  const [saving, setSaving] = useState(false)
  const [permSheetOpen, setPermSheetOpen] = useState(false)
  const [deniedOpen, setDeniedOpen] = useState(false)
  /** 4/5 → 저장 직후 5번째 하트까지 채운 뒤 팝 */
  const [progressIndex, setProgressIndex] = useState(3)
  const [popLast, setPopLast] = useState(false)

  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didNavigate = useRef(false)

  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current)
    }
  }, [])

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(copy.dummyCode)
    } catch {
      // ignore clipboard failures
    }
    showToast(copy.copiedToast)
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

  const finishSave = async (toastMsg?: string) => {
    if (saving) return
    setSaving(true)
    try {
      await Clipboard.setStringAsync(copy.dummyCode)
    } catch {
      // ignore
    }
    if (toastMsg) showToast(toastMsg)

    setProgressIndex(4)
    setPopLast(true)

    navTimer.current = setTimeout(() => {
      goWelcome()
    }, SAVE_NAV_DELAY_MS)
  }

  /** CTA → 권한 안내 시트 */
  const onPressSave = () => {
    if (saving) return
    setPermSheetOpen(true)
  }

  /** 다른 방법 = 클립보드만 저장하고 진행 */
  const saveOtherWay = () => {
    setPermSheetOpen(false)
    void finishSave(copy.copiedToast)
  }

  /** 알겠어요 → 권한 안내 후 저장 (클립보드). 네이티브 사진첩 모듈은 웹 SSR에서 깨져 보류 */
  const requestPhotoPermission = async () => {
    setPermSheetOpen(false)
    await finishSave(
      '번호가 클립보드에 복사됐어요. 스크린샷으로도 보관해 주세요.',
    )
  }

  /** 권한 없이도 이어서 진행 (클립보드) */
  const continueWithoutPhoto = () => {
    setDeniedOpen(false)
    void finishSave(copy.copiedToast)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={copy.header}
        onBack={saving ? undefined : () => router.back()}
      />

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
            disabled={saving}
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
            onPress={onPressSave}
          />
        )}
      </View>

      <PhotoPermissionSheet
        visible={permSheetOpen}
        onAllow={() => {
          void requestPhotoPermission()
        }}
        onOtherWay={saveOtherWay}
      />

      <PhotoPermissionDeniedDialog
        visible={deniedOpen}
        onClose={continueWithoutPhoto}
      />
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
