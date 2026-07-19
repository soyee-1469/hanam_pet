import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import {
  PrimaryButton,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().welcomePrep
/** 온보딩 전체 진행(ob-01~) — 첫 점 활성 */
const TOUR_TOTAL = 8

export default function OnboardingWelcomePrep() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
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
    paddingHorizontal: 28,
    // 제목·본문을 상단 쪽에 두고, 닷·CTA는 푸터에
    paddingBottom: 72,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
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
