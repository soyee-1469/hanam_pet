import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { CaretLeft, CaretRight, Info } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  getSeverityBand,
  getSeverityBands,
  type AssessmentId,
  type SeverityBand,
  type SeverityId,
} from '../constants/MindAssessments'
import {
  formatResultDate,
  formatResultDateShort,
  getMindCheckResults,
  type MindCheckResultRecord,
} from '../lib/mindCheckResults'

type TabId = AssessmentId

const TABS: { id: TabId; label: string }[] = [
  { id: 'phq', label: '우울' },
  { id: 'gad', label: '불안' },
  { id: 'stress', label: '스트레스' },
]

/** 카드/분포용 파스텔 세그먼트 */
const SEG_PASTEL: Record<SeverityId, string> = {
  normal: '#C8D9B8',
  mild: '#F5E3A8',
  moderate: '#F7D7B8',
  severe: '#F5D0CD',
}

const SEG_EMPTY = '#EDE6DE'

function bandLevel(band: SeverityBand, bands: SeverityBand[]): number {
  const i = bands.findIndex((b) => b.id === band.id)
  return i < 0 ? 1 : i + 1
}

function cardSummary(band: SeverityBand): string {
  if (band.id === 'normal') {
    return '전반적으로 차분하고 안정적인 상태를 잘 유지하고 있어요.'
  }
  if (band.id === 'mild') {
    return '가벼운 변화가 보여요. 셀프케어와 관찰을 이어가 보면 좋아요.'
  }
  if (band.id === 'moderate') {
    return '의욕 저하·일상 부담에 세심한 돌봄이 필요한 단계예요.'
  }
  return '혼자 견디기보다 전문적인 도움을 빠르게 받아보는 것이 좋아요.'
}

export default function MindReportScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const initialTab = (typeof params.tab === 'string'
    ? params.tab
    : params.tab?.[0]) as TabId | undefined
  const [tab, setTab] = useState<TabId>(
    initialTab && TABS.some((t) => t.id === initialTab) ? initialTab : 'phq',
  )
  const [records, setRecords] = useState<MindCheckResultRecord[]>([])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void getMindCheckResults().then((list) => {
        if (alive) setRecords(list)
      })
      return () => {
        alive = false
      }
    }, []),
  )

  const bands = useMemo(() => getSeverityBands(tab), [tab])
  const list = useMemo(
    () => records.filter((r) => r.assessmentId === tab),
    [records, tab],
  )

  const dist = useMemo(() => {
    const counts: Record<string, number> = {}
    bands.forEach((b) => {
      counts[b.id] = 0
    })
    list.forEach((r) => {
      const b = getSeverityBand(r.score, tab)
      counts[b.id] = (counts[b.id] ?? 0) + 1
    })
    return bands.map((b) => ({
      id: b.id,
      label: b.label,
      count: counts[b.id] ?? 0,
      color: SEG_PASTEL[b.id] ?? Colors.creamyBeige,
    }))
  }, [list, bands, tab])

  const trend = useMemo(() => {
    const chronological = [...list].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    )
    return chronological.slice(-6)
  }, [list])

  const maxScore = bands[bands.length - 1]?.max ?? 36

  const openDetail = (item: MindCheckResultRecord) => {
    router.push({
      pathname: '/mind-check-result',
      params: {
        id: item.assessmentId,
        score: String(item.score),
        max: String(item.max),
        view: '1',
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>지나온 마음 기록</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const on = tab === t.id
          return (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setTab(t.id)}
              style={styles.tabBtn}
            >
              <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>
                {t.label}
              </Text>
              {on ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          )
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Info size={18} color={Colors.accent} weight="fill" />
          <Text style={styles.infoText}>
            이제까지 알아본 자가진단 결과 기록을 볼 수 있어요. 정기적인 상태
            확인이 마음 건강의 첫걸음이에요.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          과거 검사 히스토리 ({list.length}건)
        </Text>

        {list.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              아직 이 검사 기록이 없어요.{'\n'}첫 점검을 시작해 볼까요?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/mind-check-intro',
                  params: { id: tab },
                })
              }
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emptyCtaText}>검사하러 가기</Text>
            </Pressable>
          </View>
        ) : (
          list.map((item) => {
            const band = getSeverityBand(item.score, tab)
            const level = bandLevel(band, bands)
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardDate}>
                    {formatResultDate(item.at)}
                  </Text>
                  <View style={styles.bandChip}>
                    <View
                      style={[styles.bandDot, { backgroundColor: band.color }]}
                    />
                    <Text style={styles.bandChipText}>{band.label}</Text>
                  </View>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>내 마음 상태</Text>
                  <Text style={[styles.scoreValue, { color: band.color }]}>
                    {item.score}점
                  </Text>
                </View>

                <View style={styles.segBar}>
                  {bands.map((b, i) => {
                    const filled = i < level
                    return (
                      <View
                        key={b.id}
                        style={[
                          styles.seg,
                          {
                            backgroundColor: filled
                              ? SEG_PASTEL[b.id] ?? b.color
                              : SEG_EMPTY,
                          },
                        ]}
                      />
                    )
                  })}
                </View>

                <Text style={styles.cardSummary} numberOfLines={2}>
                  {cardSummary(band)}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="상세보기"
                  onPress={() => openDetail(item)}
                  style={({ pressed }) => [
                    styles.detailBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.detailText}>상세보기</Text>
                  <CaretRight
                    size={14}
                    color={Colors.textSecondary}
                    weight="bold"
                  />
                </Pressable>
              </View>
            )
          })
        )}

        {list.length > 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>최근 점수 추이</Text>
              <Text style={styles.chartCount}>{trend.length}회</Text>
            </View>

            <View style={styles.bars}>
              {trend.map((item) => {
                const band = getSeverityBand(item.score, tab)
                const h = Math.max(
                  8,
                  Math.round((item.score / maxScore) * 100),
                )
                return (
                  <View key={item.id} style={styles.barCol}>
                    <Text style={styles.barScore}>{item.score}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${h}%`,
                            backgroundColor:
                              SEG_PASTEL[band.id] ?? Colors.peach,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barDay}>
                      {formatResultDateShort(item.at)}
                    </Text>
                  </View>
                )
              })}
            </View>

            <View style={styles.distBar}>
              {dist.every((d) => d.count === 0) ? (
                <View style={[styles.distSeg, { flex: 1, backgroundColor: SEG_EMPTY }]} />
              ) : (
                dist
                  .filter((d) => d.count > 0)
                  .map((d) => (
                    <View
                      key={d.id}
                      style={[
                        styles.distSeg,
                        { flex: d.count, backgroundColor: d.color },
                      ]}
                    >
                      <Text style={styles.distSegNum}>{d.count}</Text>
                    </View>
                  ))
              )}
            </View>
            <View style={styles.legendRow}>
              {dist.map((d) => (
                <View key={d.id} style={styles.legendItem}>
                  <View
                    style={[styles.legendSwatch, { backgroundColor: d.color }]}
                  />
                  <Text style={styles.legendLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.chartHint}>
              마음일기처럼 구간별 분포와 최근 점수 흐름을 함께 살펴볼 수 있어요.
            </Text>
          </View>
        ) : null}
      </ScrollView>
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
    paddingBottom: 8,
    minHeight: 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    paddingTop: 4,
    paddingBottom: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  tabLabelOn: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Shadows.elevation,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyCta: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    ...Shadows.elevation,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bandChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  segBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  seg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  cardSummary: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  detailBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chartCard: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Shadows.elevation,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  chartCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 16,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barScore: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    flex: 1,
    width: '70%',
    maxWidth: 28,
    borderRadius: 8,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    minHeight: 8,
  },
  barDay: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  distBar: {
    flexDirection: 'row',
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  distSeg: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  distSegNum: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chartHint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textDisabled,
  },
})
