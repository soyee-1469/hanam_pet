import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { CaretDown, CaretUp, Warning } from 'phosphor-react-native'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import { PhotoPermissionSheet } from '../../components/PhotoPermissionSheet'
import { getOnboardingCopy } from '../../lib/onboarding'
import { showToast } from '../../lib/toast'

const copy = getOnboardingCopy().restoreCode

const SAVE_NAV_DELAY_MS = 900

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function OnboardingRestoreCode() {
  const [saving, setSaving] = useState(false)
  const [permSheetOpen, setPermSheetOpen] = useState(false)
  const [methodsOpen, setMethodsOpen] = useState(true)

  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didNavigate = useRef(false)

  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current)
    }
  }, [])

  const codeDisplay = `${copy.dummyCode.slice(0, 4)} ${copy.dummyCode.slice(4)}`

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

    navTimer.current = setTimeout(() => {
      goWelcome()
    }, SAVE_NAV_DELAY_MS)
  }

  const onPressSave = () => {
    if (saving) return
    setPermSheetOpen(true)
  }

  const saveOtherWay = () => {
    setPermSheetOpen(false)
    void finishSave(copy.copiedToast)
  }

  const confirmCopy = async () => {
    setPermSheetOpen(false)
    await finishSave(
      '번호가 클립보드에 복사됐어요. 스크린샷으로도 보관해 주세요.',
    )
  }

  const toggleMethods = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMethodsOpen((prev) => !prev)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader onBack={saving ? undefined : () => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headline}>{copy.headline}</Text>
        <Text style={styles.sub}>{copy.body}</Text>

        <View style={styles.codeCard}>
          <View style={styles.codeCopy}>
            <Text style={styles.codeLabel}>{copy.codeLabel}</Text>
            <Text style={styles.codeValue}>{codeDisplay}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="번호 복사"
            disabled={saving}
            onPress={() => {
              void copyCode()
            }}
            style={({ pressed }) => [
              styles.copyBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.copyBtnText}>{copy.copyBtn}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: methodsOpen }}
          accessibilityLabel={copy.tip}
          onPress={toggleMethods}
          style={({ pressed }) => [
            styles.accordionHeader,
            pressed && styles.pressed,
          ]}
        >
          <Warning size={18} color={Colors.error} weight="fill" />
          <Text style={styles.accordionTitle}>{copy.tip}</Text>
          {methodsOpen ? (
            <CaretUp size={18} color={Colors.textPrimary} weight="bold" />
          ) : (
            <CaretDown size={18} color={Colors.textPrimary} weight="bold" />
          )}
        </Pressable>

        {methodsOpen
          ? copy.methods.map((method, index) => (
              <View key={method.title} style={styles.methodCard}>
                <View style={styles.methodIndex}>
                  <Text style={styles.methodIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.methodCopy}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodBody}>{method.body}</Text>
                </View>
              </View>
            ))
          : null}
      </ScrollView>

      <View style={styles.footer}>
        {saving ? (
          <View style={styles.savingCta}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.savingCtaText}>{copy.ctaBusy}</Text>
          </View>
        ) : (
          <PrimaryButton label={copy.cta} emphasized onPress={onPressSave} />
        )}
      </View>

      <PhotoPermissionSheet
        visible={permSheetOpen}
        onAllow={() => {
          void confirmCopy()
        }}
        onOtherWay={saveOtherWay}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
  },
  flex: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
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
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  codeCopy: {
    flex: 1,
    minWidth: 0,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  copyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.selected,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  accordionTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
    lineHeight: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.beige,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  methodIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIndexText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  methodCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  methodBody: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
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
  pressed: {
    opacity: 0.88,
  },
})
