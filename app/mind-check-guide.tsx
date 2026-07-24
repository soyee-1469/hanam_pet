import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import {
  CaretDown,
  CaretLeft,
  Info,
  Question,
  WarningCircle,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import {
  getAssessment,
  getSeverityBands,
  SEVERITY_PILL_BG,
  SEVERITY_PILL_TEXT,
  type AssessmentId,
} from '../constants/MindAssessments'
export default function MindCheckGuideScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const assessmentId = (typeof id === 'string'
    ? id
    : id?.[0] ?? 'phq') as AssessmentId
  const assessment = getAssessment(assessmentId)

  const howItWorks = assessment
    ? [
        {
          title: '문항은 어떻게 구성되나요?',
          body: `지난 2주간의 경험을 기준으로 관련 문항에 답해요. 각 문항은 0~3점으로 반영됩니다.`,
        },
        {
          title: '점수는 어떻게 계산되나요?',
          body: `${assessment.questions.length}문항 × 최대 3점 = ${assessment.questions.length * 3}점 만점이에요. 점수가 높을수록 최근 2주간 ${
            assessmentId === 'gad'
              ? '불안'
              : assessmentId === 'stress'
                ? '스트레스'
                : '우울'
          } 관련 느낌이 더 두드러졌을 수 있어요.`,
        },
        {
          title: '결과는 진단인가요?',
          body: '아니요. 이 결과는 스스로 마음을 살펴보는 참고용이에요. 의학적 진단이나 치료를 대체하지 않아요.',
        },
      ]
    : []

  const [openFaq, setOpenFaq] = useState<string | null>(
    howItWorks[0]?.title ?? null,
  )
  const [openBand, setOpenBand] = useState<string | null>(null)

  if (!assessment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>검사 결과 설명</Text>
          <View style={styles.sideBtn} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>검사를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const bands = getSeverityBands(assessment.id)

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
        <Text style={styles.headerTitle}>검사 결과 설명</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          {assessment.title} 결과 화면의 점수와 구간이 무엇을 의미하는지
          안내해요.
        </Text>

        <View style={styles.sectionHead}>
          <Info size={18} color={Colors.textSecondary} weight="regular" />
          <Text style={styles.sectionLabel}>점수 구간별 의미</Text>
        </View>
        <View style={styles.card}>
          {bands.map((band, i) => {
            const open = openBand === band.id
            return (
              <View
                key={band.id}
                style={[
                  styles.bandRow,
                  i < bands.length - 1 && styles.bandDivider,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() =>
                    setOpenBand((prev) => (prev === band.id ? null : band.id))
                  }
                  style={styles.accordionHeader}
                >
                  <View style={styles.bandHeaderLeft}>
                    <View
                      style={[
                        styles.bandPill,
                        {
                          backgroundColor:
                            SEVERITY_PILL_BG[band.id] ?? Colors.creamyBeige,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bandPillText,
                          {
                            color:
                              SEVERITY_PILL_TEXT[band.id] ?? Colors.textPrimary,
                          },
                        ]}
                      >
                        {band.min}~{band.max}
                      </Text>
                    </View>
                    <Text style={styles.bandTitle}>{band.label}</Text>
                  </View>
                  <View
                    style={{
                      transform: [{ rotate: open ? '180deg' : '0deg' }],
                    }}
                  >
                    <CaretDown
                      size={16}
                      color={Colors.textSecondary}
                      weight="bold"
                    />
                  </View>
                </Pressable>
                {open ? (
                  <Text style={styles.bandBody}>{band.meaning}</Text>
                ) : null}
              </View>
            )
          })}
        </View>

        <View style={styles.sectionHead}>
          <Question size={18} color={Colors.textSecondary} weight="regular" />
          <Text style={styles.sectionLabel}>알아두면 좋아요</Text>
        </View>
        <View style={styles.card}>
          {howItWorks.map((item, i) => {
            const open = openFaq === item.title
            return (
              <View
                key={item.title}
                style={[
                  styles.howRow,
                  i < howItWorks.length - 1 && styles.bandDivider,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() =>
                    setOpenFaq((prev) =>
                      prev === item.title ? null : item.title,
                    )
                  }
                  style={styles.accordionHeader}
                >
                  <Text style={styles.howTitle}>{item.title}</Text>
                  <View
                    style={{
                      transform: [{ rotate: open ? '180deg' : '0deg' }],
                    }}
                  >
                    <CaretDown
                      size={16}
                      color={Colors.textSecondary}
                      weight="bold"
                    />
                  </View>
                </Pressable>
                {open ? <Text style={styles.howBody}>{item.body}</Text> : null}
              </View>
            )
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="긴급 상담 안내 보기"
          onPress={() => router.push('/support')}
          style={({ pressed }) => [styles.notice, pressed && styles.pressed]}
        >
          <WarningCircle size={18} color={Colors.error} weight="fill" />
          <Text style={styles.noticeText}>
            위급한 상황이면 109·1577-0199 등 긴급 상담 전화를 이용해 주세요.
            도움 기관 보기
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="검사하러 가기"
          emphasized
          onPress={() =>
            router.push({
              pathname: '/mind-check-intro',
              params: { id: assessment.id },
            })
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.headerPaddingH,
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
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.blockGap,
  },
  lead: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 4,
    marginBottom: 20,
    ...Shadows.elevation,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
  },
  bandRow: {
    paddingVertical: 2,
  },
  bandDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  bandHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  bandPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bandPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bandTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bandBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textSecondary,
    paddingLeft: 4,
    paddingBottom: Layout.sectionGap,
  },
  howRow: {
    paddingVertical: 2,
  },
  howTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  howBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    paddingBottom: Layout.sectionGap,
  },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  footer: {
    ...onboardingFooterStyle,
    paddingTop: Layout.sectionGap,
  },
})
