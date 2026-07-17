import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Play } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().healingContent
const INTRO_SLIDE_COUNT = getOnboardingCopy().intro.slides.length
/** intro + 기록 + 힐링 + 마음체크 */
const PAGER_TOTAL = INTRO_SLIDE_COUNT + 3
const PAGER_INDEX = INTRO_SLIDE_COUNT + 1

const TONE = {
  peach: { thumb: '#EDE4D8', tagBg: '#F5EDE6', tagText: Colors.textSecondary },
  sky: { thumb: '#D6EAF5', tagBg: '#E8F1F8', tagText: '#5B8FBF' },
  sage: { thumb: '#E2EAD8', tagBg: Colors.sageSoft, tagText: '#6F7F62' },
} as const

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.mid}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.sub}</Text>
        <Text style={styles.previewHint}>{copy.previewHint}</Text>

        <View style={styles.previewList}>
          {copy.previews.map((item) => {
            const tone = TONE[item.tone]
            return (
              <View key={item.title} style={styles.previewCard}>
                <View style={[styles.thumb, { backgroundColor: tone.thumb }]}>
                  <View style={styles.playBadge}>
                    <Play size={14} color={Colors.surface} weight="fill" />
                  </View>
                </View>
                <View style={styles.previewCopy}>
                  <View style={[styles.tag, { backgroundColor: tone.tagBg }]}>
                    <Text style={[styles.tagText, { color: tone.tagText }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.previewMeta}>{item.meta}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TourDots total={PAGER_TOTAL} index={PAGER_INDEX} />
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
  flex: {
    flex: 1,
    minHeight: 0,
  },
  mid: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 32,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 0,
    lineHeight: 20,
  },
  previewHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
    marginTop: 32,
    marginBottom: 8,
  },
  previewList: {
    gap: 10,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    ...Shadows.elevation,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(91, 57, 39, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  previewCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 0,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewTitle: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 21,
    width: '100%',
  },
  previewMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
