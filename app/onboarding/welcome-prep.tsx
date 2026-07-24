import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import {
  PrimaryButton,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().welcomePrep
/** 온보딩 전체 진행(ob-01~) — 첫 점 활성 */
const TOUR_TOTAL = 8
const PREP_HERO = require('../../assets/images/onboarding_1.png')

export default function OnboardingWelcomePrep() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Image
          source={PREP_HERO}
          style={styles.hero}
          resizeMode="contain"
          accessibilityLabel="힐링펫"
        />
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.bodyText}>{copy.body}</Text>
      </View>

      <View style={styles.footer}>
        <TourDots total={TOUR_TOTAL} index={0} />
        <PrimaryButton
          label={copy.cta}
          emphasized
          onPress={() => router.push('/onboarding/intro')}
        />
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
    paddingBottom: 40,
  },
  hero: {
    width: 220,
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 14,
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
})
