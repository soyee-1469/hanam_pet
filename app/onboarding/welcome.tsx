import { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { DogExpr } from '../../constants/DogExpr'
import {
  PrimaryButton,
  ProgressDots,
  onboardingFooterStyle,
} from '../../components/ui'
import {
  ONBOARDING_STEPS,
  getOnboardingDraft,
  resetOnboardingDraft,
} from '../../lib/onboardingDraft'
import { completeOnboarding, type PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { defaultPetName, setPetName } from '../../lib/petProfile'

const copy = getOnboardingCopy().welcome

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.fun,
  nami: require('../../assets/images/cat-character_2.png'),
}

export default function OnboardingWelcome() {
  const [busy, setBusy] = useState(false)
  const draft = getOnboardingDraft()
  const petId: PetChoice = draft.petId ?? 'mongi'
  const petName = draft.petName.trim() || defaultPetName(petId)

  const goHome = async () => {
    if (busy) return
    setBusy(true)
    try {
      await completeOnboarding({
        nickname: draft.nickname || '친구',
        petId: draft.petId ?? 'mongi',
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
        <View style={styles.petGlow}>
          <Image
            source={PET_IMAGES[petId]}
            style={styles.pet}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {copy.title(petName)}
        </Text>
        <Text style={styles.bodyText} numberOfLines={4}>
          {copy.body(petName)}
        </Text>
      </View>

      <View style={styles.footer}>
        <ProgressDots total={ONBOARDING_STEPS} index={4} />
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
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  petGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pet: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 34,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  loader: {
    height: 54,
  },
})
