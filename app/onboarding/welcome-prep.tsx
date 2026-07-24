import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().welcomePrep

/**
 * ob-01 — 하치·나미 만나기 전 준비 안내
 * TourDots는 intro~mind 7단계만 사용 (이 화면은 투어 전 안내)
 */
export default function OnboardingWelcomePrep() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        onSkip={() => router.push('/onboarding/terms')}
        skipLabel="건너뛰기"
      />

      <View style={styles.body}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.bodyText}>{copy.body}</Text>
      </View>

      <View style={styles.footer}>
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
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.spaceXl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 18,
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
