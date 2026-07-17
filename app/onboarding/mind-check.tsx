import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  ClipboardText,
  ChartBar,
  UserPlus,
  CheckCircle,
  TrendUp,
} from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().mindCheck
const INTRO_SLIDE_COUNT = getOnboardingCopy().intro.slides.length
/** intro + 기록 + 힐링 + 마음체크 */
const PAGER_TOTAL = INTRO_SLIDE_COUNT + 3
const PAGER_INDEX = INTRO_SLIDE_COUNT + 2

/** 체크·바는 톤다운 — 점수/`+8점`만 primary */
const MUTED_CHECK = Colors.taupe
const MUTED_BAR = Colors.sand

const FEATURE_ICONS = {
  clipboard: ClipboardText,
  chart: ChartBar,
  userPlus: UserPlus,
} as const

const softCard = {
  backgroundColor: Colors.cardRecessed,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: Colors.divider,
} as const

export default function OnboardingMindCheck() {
  const goNext = () => router.push('/onboarding/terms')
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
        <Text style={styles.sub}>{copy.sub}</Text>

        <View style={styles.dashboard}>
          <Text style={styles.checklistTitle}>{copy.checklistTitle}</Text>
          {copy.checklist.map((item) => (
            <View key={item.label} style={styles.checkRow}>
              <CheckCircle size={20} color={MUTED_CHECK} weight="fill" />
              <Text style={styles.checkLabel}>{item.label}</Text>
            </View>
          ))}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.scoreLabel}</Text>
              <Text style={styles.scoreValue}>{copy.scoreValue}</Text>
              <View style={styles.scoreTrack}>
                <View
                  style={[
                    styles.scoreFill,
                    { width: `${Math.round(copy.scoreProgress * 100)}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.compareLabel}</Text>
              <View style={styles.compareValueRow}>
                <TrendUp size={18} color={Colors.primary} weight="bold" />
                <Text style={styles.compareValue}>{copy.compareValue}</Text>
              </View>
              <Text style={styles.compareHint}>{copy.compareHint}</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureList}>
          {copy.features.map((item, index) => {
            const Icon = FEATURE_ICONS[item.icon]
            return (
              <View key={item.key} style={styles.featureCard}>
                <View style={styles.featureCopy}>
                  <View style={styles.featureTitleRow}>
                    <View style={styles.numBadge}>
                      <Text style={styles.numBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.featureBody}>{item.body}</Text>
                </View>
                <Icon size={18} color={Colors.taupe} weight="duotone" />
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
    marginBottom: 8,
    lineHeight: 32,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  dashboard: {
    ...softCard,
    padding: 16,
    marginBottom: 14,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  scoreTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.divider,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: MUTED_BAR,
  },
  compareValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  compareValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  compareHint: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    ...softCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingLeft: 16,
    paddingRight: 20,
    gap: 14,
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    lineHeight: 13,
  },
  featureTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  featureBody: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 28,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
