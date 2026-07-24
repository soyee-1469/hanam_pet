import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { onboardingMascot } from '../../constants/OnboardingMascot'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { OnboardingTalkStage } from '../../components/OnboardingTalkStage'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().healingContent
const TOUR_TOTAL = 6
const TOUR_INDEX = 4

export default function OnboardingHealingContent() {
  const goNext = () => router.push('/onboarding/mind-check')
  const skipToTerms = () => router.push('/onboarding/terms')

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        onBack={() => router.back()}
        onSkip={skipToTerms}
        skipLabel={copy.skip}
      />

      <View style={styles.body}>
        <OnboardingTalkStage
          image={onboardingMascot(1, copy.image)}
          bubble={copy.bubble}
          title={copy.title}
          body={copy.body}
        />
      </View>

      <View style={styles.footer}>
        <TourDots total={TOUR_TOTAL} index={TOUR_INDEX} />
        <PrimaryButton label={copy.cta} emphasized onPress={goNext} />
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
    justifyContent: 'center',
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
