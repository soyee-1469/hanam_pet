import { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Heart } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { PrimaryButton, onboardingFooterStyle } from '../../components/ui'
import {
  getOnboardingDraft,
  resetOnboardingDraft,
} from '../../lib/onboardingDraft'
import { completeOnboarding } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { defaultPetName, setPetName } from '../../lib/petProfile'

const copy = getOnboardingCopy().welcome

/**
 * 온보딩 완료 — 하치·나미가 기다리는 환영 화면
 */
export default function OnboardingWelcome() {
  const [busy, setBusy] = useState(false)
  const draft = getOnboardingDraft()
  const petId = draft.petId ?? 'mongi'
  const petName = draft.petName.trim() || defaultPetName(petId)

  const goHome = async () => {
    if (busy) return
    setBusy(true)
    try {
      await completeOnboarding({
        nickname: draft.nickname || '친구',
        petId,
      })
      await setPetName(petName)
      resetOnboardingDraft()
      router.replace('/(tabs)')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.hero} accessibilityLabel="하치와 나미">
          <View style={styles.duo}>
            <Image
              source={DogExpr.wink}
              style={styles.dog}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Image
              source={CatExpr.fun}
              style={styles.cat}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
          <View style={styles.ground}>
            <View style={styles.groundLine} />
            <View style={styles.heart}>
              <Heart size={18} color={Colors.primary} weight="fill" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{copy.title()}</Text>
        <Text style={styles.sub}>{copy.body()}</Text>
      </View>

      <View style={styles.footer}>
        {busy ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : (
          <PrimaryButton
            label={copy.cta}
            emphasized
            onPress={() => {
              void goHome()
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
    backgroundColor: Colors.creamyBeige,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  duo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dog: {
    width: 168,
    height: 168,
    marginRight: -28,
    zIndex: 1,
  },
  cat: {
    width: 132,
    height: 132,
    marginBottom: 4,
    zIndex: 2,
  },
  ground: {
    marginTop: -6,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundLine: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.beige,
  },
  heart: {
    position: 'absolute',
    right: 18,
    top: -10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  loader: {
    height: 54,
  },
})
