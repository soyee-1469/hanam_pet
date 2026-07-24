import { useMemo, useState } from 'react'
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
  CaretLeft,
  CaretUp,
  CheckCircle,
  Phone,
} from 'phosphor-react-native'
import Svg, { Circle } from 'react-native-svg'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HelpContactsSheet } from '../components/HelpContactsSheet'
import {
  getSeverityBand,
  getSeverityBands,
  statusLabel,
  type AssessmentId,
} from '../constants/MindAssessments'
import { showToast } from '../lib/toast'
import { saveMindCheckResult } from '../lib/mindCheckResults'

function goMindCheckTab() {
  router.replace({
    pathname: '/(tabs)/mind',
    params: { segment: 'check' },
  })
}

const RING_SIZE = 160
const RING_STROKE = 14
const RING_R = (RING_SIZE - RING_STROKE) / 2
const RING_C = 2 * Math.PI * RING_R

function ScoreRing({
  score,
  max,
  color,
}: {
  score: number
  max: number
  color: string
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, score / max)) : 0
  const offset = RING_C * (1 - ratio)

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          stroke={Colors.energyTrack}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          stroke={color}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${RING_C} ${RING_C}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringScore, { color }]}>{score}</Text>
        <Text style={styles.ringMax}>{max}점</Text>
      </View>
    </View>
  )
}

export default function MindCheckResultScreen() {
  const params = useLocalSearchParams<{
    id?: string
    score?: string
    max?: string
    fresh?: string
    view?: string
  }>()
  const assessmentId = (typeof params.id === 'string'
    ? params.id
    : params.id?.[0]) as AssessmentId | undefined
  const viewParam =
    params.view === '1' ||
    (Array.isArray(params.view) && params.view[0] === '1')
  const freshMode =
    params.fresh === '1' ||
    (Array.isArray(params.fresh) && params.fresh[0] === '1')
  const viewMode = viewParam || !freshMode

  const bands = useMemo(() => getSeverityBands(assessmentId), [assessmentId])
  const score = Number(params.score ?? 20)
  const max = Number(params.max ?? (bands[bands.length - 1]?.max ?? 36))
  const band = useMemo(
    () => getSeverityBand(score, assessmentId),
    [score, assessmentId],
  )
  const [saving, setSaving] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const accent = band.color

  const persistAndGoHome = async () => {
    await saveMindCheckResult({
      assessmentId: assessmentId ?? 'phq',
      score,
      max,
    })
    showToast('평가 결과가 보관되었어요')
    goMindCheckTab()
  }

  const confirm = () => {
    if (viewMode) {
      router.back()
      return
    }
    if (saving) return
    setSaving(true)
    void (async () => {
      try {
        await persistAndGoHome()
      } catch {
        showToast('저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
        setSaving(false)
      }
    })()
  }

  const requestBack = () => {
    if (!freshMode || viewMode) {
      router.back()
      return
    }
    setLeaveOpen(true)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={requestBack}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>나의 마음 보고서</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.statusLabel}>{statusLabel(assessmentId)}</Text>
          <ScoreRing score={score} max={max} color={accent} />
          <View style={styles.spectrumRow}>
            {bands.map((b) => {
              const mine = b.id === band.id
              return (
                <View key={b.id} style={styles.spectrumItem}>
                  <View
                    style={[styles.spectrumSeg, { backgroundColor: b.color }]}
                  />
                  <Text
                    style={[
                      styles.spectrumLabel,
                      mine && { fontWeight: '800', color: accent },
                    ]}
                  >
                    {b.label} {b.min}-{b.max}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.opinionWrap}>
          <View style={styles.opinionCard}>
            <View style={styles.opinionHead}>
              <Text style={styles.opinionTitle}>전문가 소견</Text>
              <View style={[styles.bandBadge, { backgroundColor: accent }]}>
                <Text style={styles.bandBadgeText}>
                  {band.label} ({score}점)
                </Text>
              </View>
            </View>
            <Text style={styles.opinionBody}>{band.opinionBody}</Text>
            <View style={styles.tips}>
              {band.tips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <CheckCircle size={20} color={Colors.primary} weight="fill" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="도움이 필요하면 전문 상담 연결"
              onPress={() => setHelpOpen(true)}
              style={({ pressed }) => [
                styles.counselBar,
                pressed && styles.pressed,
              ]}
            >
              <Phone size={18} color={Colors.selected} weight="fill" />
              <Text style={styles.counselBarText}>
                도움이 필요하면 전문 상담 연결
              </Text>
              <CaretUp size={16} color={Colors.selected} weight="bold" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={viewMode ? '닫기' : '확인했어요'}
          emphasized
          disabled={saving}
          onPress={confirm}
        />
      </View>

      <ConfirmDialog
        visible={leaveOpen}
        title="결과를 저장할까요?"
        body="확인하지 않으면 방금 검사한 결과가 보관되지 않아요."
        cancelLabel="저장 안 함"
        confirmLabel="저장할게요"
        tone="warning"
        onCancel={() => {
          setLeaveOpen(false)
          goMindCheckTab()
        }}
        onConfirm={() => {
          setLeaveOpen(false)
          if (saving) return
          setSaving(true)
          void (async () => {
            try {
              await persistAndGoHome()
            } catch {
              showToast('저장에 실패했어요. 잠시 후 다시 시도해 주세요.')
              setSaving(false)
            }
          })()
        }}
      />

      <HelpContactsSheet
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
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
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 28,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 18,
    paddingBottom: Layout.blockGap,
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.elevation,
  },
  statusLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 50,
  },
  ringMax: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  spectrumRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 6,
  },
  spectrumItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  spectrumSeg: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
  },
  spectrumLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  opinionWrap: {
    marginBottom: 8,
  },
  opinionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: Layout.blockGap,
    paddingBottom: Layout.blockGap,
    ...Shadows.elevation,
  },
  opinionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  opinionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bandBadge: {
    borderRadius: 999,
    paddingHorizontal: Layout.headerPaddingH,
    paddingVertical: 6,
  },
  bandBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  opinionBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  tips: {
    gap: 12,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  counselBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  counselBarText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  footer: {
    ...onboardingFooterStyle,
    paddingTop: Layout.contentPaddingBottom,
  },
})
