import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  PencilSimple,
  CalendarBlank,
  User,
  Heart,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { MoodEmoji } from '../../components/MoodEmoji'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().diaryRecord
const INTRO_SLIDE_COUNT = getOnboardingCopy().intro.slides.length
/** intro + 기록 + 힐링 + 마음체크 */
const PAGER_TOTAL = INTRO_SLIDE_COUNT + 3
const PAGER_INDEX = INTRO_SLIDE_COUNT

const FEATURE_ICONS = {
  pencil: PencilSimple,
  calendar: CalendarBlank,
  user: User,
} as const

/** 히어로 미니 캘린더용 데모 감정 (에셋 PNG 없이 기존 이모지로 구성) */
const HERO_MOODS: (1 | 2 | 3 | 4 | 5 | null)[] = [
  1, 2, 3, null, 5, 4, 2, 1, null, 3, 1, 2,
]

export default function OnboardingDiaryRecord() {
  const goNext = () => router.push('/onboarding/healing-content')
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
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{copy.title}</Text>

        <View style={styles.hero}>
          <View style={styles.heroCalendar}>
            <View style={styles.heroCalHeader}>
              <View style={styles.heroCalDot} />
              <View style={styles.heroCalDot} />
              <View style={styles.heroCalDot} />
            </View>
            <View style={styles.heroCalGrid}>
              {HERO_MOODS.map((mood, i) => (
                <View key={i} style={styles.heroCalCell}>
                  {mood ? <MoodEmoji index={mood} size={18} /> : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.heroDiary}>
            <View style={styles.heroDiaryPage}>
              <Text style={styles.heroEntryLabel}>{copy.heroEntryLabel}</Text>
              <Text style={styles.heroFeelingLabel}>{copy.heroFeelingLabel}</Text>
            </View>
            <View style={styles.heroDiaryPage}>
              <View style={styles.heroLine} />
              <View style={styles.heroLine} />
              <View style={[styles.heroLine, styles.heroLineShort]} />
              <View style={styles.heroHeart}>
                <Heart size={14} color={Colors.taupe} weight="fill" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.featureList}>
          {copy.features.map((item) => {
            const Icon = FEATURE_ICONS[item.icon]
            return (
              <View key={item.key} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon size={20} color={Colors.textSecondary} weight="regular" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureBody}>{item.body}</Text>
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
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 16,
    lineHeight: 32,
  },
  hero: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  heroCalendar: {
    width: '78%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 10,
    ...Shadows.elevation,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroCalHeader: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  heroCalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sand,
  },
  heroCalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heroCalCell: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDiary: {
    width: '86%',
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 72,
    ...Shadows.elevation,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  heroDiaryPage: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  heroEntryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  heroFeelingLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  heroLine: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    marginBottom: 6,
  },
  heroLineShort: {
    width: '55%',
  },
  heroHeart: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureBody: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
