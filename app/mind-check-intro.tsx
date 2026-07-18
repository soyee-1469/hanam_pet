import { useCallback, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  FileMagnifyingGlass,
  WarningCircle,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import {
  getAssessment,
  getSeverityBand,
  getSeverityBands,
  type AssessmentId,
} from '../constants/MindAssessments'
import {
  formatResultDate,
  getLatestMindCheckResult,
  type MindCheckResultRecord,
} from '../lib/mindCheckResults'

/** 결과 해석 pill 면색 (파스텔) */
const BAND_PILL_BG: Record<string, string> = {
  normal: '#E4EBB8',
  mild: '#FBECC4',
  moderate: '#F7D7B8',
  severe: '#F5D0CD',
}

export default function MindCheckIntroScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const assessmentId = (typeof id === 'string'
    ? id
    : id?.[0] ?? 'phq') as AssessmentId
  const assessment = getAssessment(assessmentId)
  const [latest, setLatest] = useState<MindCheckResultRecord | null>(null)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void getLatestMindCheckResult(assessmentId).then((r) => {
        if (alive) setLatest(r)
      })
      return () => {
        alive = false
      }
    }, [assessmentId]),
  )

  if (!assessment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            style={styles.sideBtn}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>평가도구</Text>
          <View style={styles.sideBtn} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>검사를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const bands = getSeverityBands(assessment.id)
  const latestBand = latest
    ? getSeverityBand(latest.score, assessment.id)
    : null

  const startCheck = () => {
    router.push({ pathname: '/mind-check', params: { id: assessment.id } })
  }

  const openLatest = () => {
    if (!latest) return
    router.push({
      pathname: '/mind-check-result',
      params: {
        id: latest.assessmentId,
        score: String(latest.score),
        max: String(latest.max),
        view: '1',
      },
    })
  }

  const openHistory = () => {
    router.push({
      pathname: '/mind-report',
      params: { tab: assessment.id },
    })
  }

  const openGuide = () => {
    router.push({
      pathname: '/mind-check-guide',
      params: { id: assessment.id },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>{assessment.shortTitle}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검사 결과 설명"
          onPress={openGuide}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <FileMagnifyingGlass
            size={22}
            color={Colors.textPrimary}
            weight="regular"
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{assessment.title}</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody}>{assessment.description}</Text>
          <View style={styles.cardDivider} />
          <View style={styles.noticeRow}>
            <WarningCircle size={16} color={Colors.error} weight="fill" />
            <Text style={styles.noticeText}>
              검사는 총 {assessment.questions.length}문항으로 구성되어 있습니다.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{assessment.bandsSectionLabel}</Text>
        <View style={styles.card}>
          {bands.map((band, i) => (
            <View
              key={band.id}
              style={[
                styles.bandRow,
                i < bands.length - 1 && styles.bandDivider,
              ]}
            >
              <View
                style={[
                  styles.bandPill,
                  { backgroundColor: BAND_PILL_BG[band.id] ?? Colors.creamyBeige },
                ]}
              >
                <Text style={styles.bandPillText}>
                  {band.min} ~ {band.max}점
                </Text>
              </View>
              <View style={styles.bandCopy}>
                <Text style={styles.bandTitle}>{band.displayTitle}</Text>
                <Text style={styles.bandMeaning}>{band.meaning}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>이런 분들께 추천해요!</Text>
        <View style={styles.card}>
          {assessment.recommends.map((line, i) => (
            <View
              key={line}
              style={[
                styles.recommendRow,
                i < assessment.recommends.length - 1 && styles.recommendGap,
              ]}
            >
              <CheckCircle size={20} color={Colors.primary} weight="fill" />
              <Text style={styles.recommendText}>{line}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>최근 검사 결과</Text>
        {latest && latestBand ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="최근 검사 결과 보기"
            onPress={openLatest}
            style={({ pressed }) => [
              styles.recentCard,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.scoreCircle,
                { borderColor: latestBand.color },
              ]}
            >
              <Text style={[styles.scoreCircleText, { color: latestBand.color }]}>
                {latest.score}점
              </Text>
            </View>
            <View style={styles.recentCopy}>
              <Text style={styles.recentDate}>
                {formatResultDate(latest.at)}
              </Text>
              <Text style={styles.recentLabel}>{latestBand.shortLabel}</Text>
            </View>
            <CaretRight size={18} color={Colors.textDisabled} weight="bold" />
          </Pressable>
        ) : (
          <View style={styles.recentEmpty}>
            <View style={styles.recentEmptyIcon}>
              <WarningCircle
                size={22}
                color={Colors.textDisabled}
                weight="regular"
              />
            </View>
            <Text style={styles.recentEmptyText}>
              아직 마음을 깊이 살펴보기 전이에요!
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="마음을 살펴 볼게요"
          emphasized
          onPress={startCheck}
        />
        <Pressable
          accessibilityRole="button"
          onPress={openHistory}
          style={({ pressed }) => [
            styles.historyLink,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.historyLinkText}>지난 마음도 살펴볼까요?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    ...Shadows.elevation,
  },
  cardBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  bandDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  bandPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 78,
    alignItems: 'center',
  },
  bandPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bandCopy: {
    flex: 1,
    minWidth: 0,
  },
  bandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bandMeaning: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendGap: {
    marginBottom: 14,
  },
  recommendText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    ...Shadows.elevation,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
  },
  recentDate: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDisabled,
    marginBottom: 4,
  },
  recentLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  recentEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 12,
    ...Shadows.elevation,
  },
  recentEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentEmptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 12,
    paddingTop: 8,
  },
  historyLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
})
