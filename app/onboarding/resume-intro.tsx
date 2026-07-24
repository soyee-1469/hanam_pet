import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Heart, Notebook } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().resume.intro

/**
 * 게이트에서 「이미 함께 하고 있어요」선택 시 —
 * 기록 가져오기 번호 입력 전 안내
 */
export default function OnboardingResumeIntro() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader onBack={() => router.back()} />

      <View style={styles.body}>
        <View style={styles.hero} accessibilityLabel="하치와 나미">
          <View style={styles.duo}>
            <Image
              source={DogExpr.soft}
              style={styles.dog}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <View style={styles.diaryBadge}>
              <Notebook size={22} color={Colors.selected} weight="fill" />
            </View>
            <Image
              source={CatExpr.soft}
              style={styles.cat}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
          <View style={styles.heart}>
            <Heart size={18} color={Colors.primary} weight="fill" />
          </View>
        </View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.body}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={copy.cta}
          emphasized
          onPress={() => router.push('/onboarding/resume')}
        />
        <Text style={styles.footerNote}>{copy.footer}</Text>
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
    paddingBottom: 16,
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
    width: 148,
    height: 148,
    marginRight: -18,
    zIndex: 1,
  },
  cat: {
    width: 124,
    height: 124,
    marginLeft: -18,
    marginBottom: 4,
    zIndex: 1,
  },
  diaryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    zIndex: 3,
  },
  heart: {
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 34,
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
  footerNote: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
})
