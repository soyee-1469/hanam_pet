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

const copy = getOnboardingCopy().petChat
/** intro 4장 다음 — 소개 토크 1/5 */
const TOUR_TOTAL = 9
const TOUR_INDEX = 4

export default function OnboardingPetChat() {
  const goNext = () => router.push('/onboarding/diary-record')
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
          image={onboardingMascot(0, copy.image)}
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
