import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { CaretDown, CaretUp, Info } from 'phosphor-react-native'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import { DogExpr } from '../../constants/DogExpr'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import { PhotoPermissionDeniedDialog } from '../../components/PhotoPermissionDeniedDialog'
import { getOnboardingDraft } from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { saveRecoveryCodeImage } from '../../lib/saveRecoveryCodeImage'
import { showToast } from '../../lib/toast'

const copy = getOnboardingCopy().restoreCode

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.soft,
  nami: require('../../assets/images/cat-character_1.png'),
}

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function OnboardingRestoreCode() {
  const draft = getOnboardingDraft()
  const petId: PetChoice = draft.petId ?? 'mongi'
  const cardRef = useRef<View>(null)

  const [saving, setSaving] = useState(false)
  const [deniedOpen, setDeniedOpen] = useState(false)
  const [methodsOpen, setMethodsOpen] = useState(false)
  const didNavigate = useRef(false)

  const codeDisplay = `${copy.dummyCode.slice(0, 4)} ${copy.dummyCode.slice(4)}`

  const goWelcome = useCallback(() => {
    if (didNavigate.current) return
    didNavigate.current = true
    router.push('/onboarding/welcome')
  }, [])

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(copy.dummyCode)
      showToast(copy.copiedToast)
    } catch {
      Alert.alert('복사 실패', '잠시 후 다시 시도해 주세요.')
    }
  }

  const saveToGallery = async () => {
    if (saving) return
    setSaving(true)
    try {
      const result = await saveRecoveryCodeImage(cardRef)
      if (result === 'saved') {
        showToast(copy.savedToast)
        goWelcome()
        return
      }
      if (result === 'denied') {
        setDeniedOpen(true)
        return
      }
      if (result === 'unsupported') {
        try {
          await Clipboard.setStringAsync(copy.dummyCode)
        } catch {
          // ignore
        }
        showToast('웹에서는 스크린샷으로 보관해 주세요')
        goWelcome()
        return
      }
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  const toggleMethods = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMethodsOpen((prev) => !prev)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        onBack={saving ? undefined : () => router.back()}
        onSkip={saving ? undefined : goWelcome}
        skipLabel={copy.skip}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>{copy.headline}</Text>
        <Text style={styles.sub}>{copy.body}</Text>

        <View ref={cardRef} collapsable={false} style={styles.codeCard}>
          <Text style={styles.codeValue}>{codeDisplay}</Text>
          <Text style={styles.codeLabel}>{copy.codeLabel}</Text>
          <Image
            source={PET_IMAGES[petId]}
            style={styles.cardPet}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
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
          <Info size={18} color={Colors.textSecondary} weight="fill" />
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
            <ActivityIndicator color={Colors.buttonPrimaryText} />
            <Text style={styles.savingCtaText}>{copy.ctaBusy}</Text>
          </View>
        ) : (
          <PrimaryButton
            label={copy.cta}
            emphasized
            onPress={() => {
              void saveToGallery()
            }}
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.copyLink}
          disabled={saving}
          onPress={() => {
            void copyCode()
          }}
          style={({ pressed }) => [
            styles.copyLinkBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.copyLinkText}>{copy.copyLink}</Text>
        </Pressable>
      </View>

      <PhotoPermissionDeniedDialog
        visible={deniedOpen}
        onClose={() => setDeniedOpen(false)}
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
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    marginBottom: 18,
    overflow: 'hidden',
    minHeight: 148,
  },
  codeValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cocoa,
    opacity: 0.85,
    maxWidth: '70%',
  },
  cardPet: {
    position: 'absolute',
    right: -4,
    bottom: -8,
    width: 108,
    height: 108,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  accordionTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    paddingTop: 8,
  },
  savingCta: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
  },
  savingCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
  copyLinkBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  copyLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cocoa,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.88,
  },
})
