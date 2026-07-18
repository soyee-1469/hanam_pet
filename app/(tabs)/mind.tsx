import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import {
  CaretRight,
  Heart,
  Moon,
  Play,
  Sparkle,
  Sun,
  ClipboardText,
  ChartBar,
  Headset,
  CheckCircle,
  RadioButton,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  MIND_CONTENTS,
  MIND_CHECKS,
  MIND_FEATURED,
  type MindContent,
  type MindMoodFilter,
} from '../../constants/MindContent'
import {
  getMindCheckResults,
  type MindCheckResultRecord,
} from '../../lib/mindCheckResults'

type TabId = 'fill' | 'check'

const TABS: { id: TabId; label: string }[] = [
  { id: 'fill', label: '마음 채우기' },
  { id: 'check', label: '마음 살피기' },
]

const FILTERS: { id: MindMoodFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '우울', label: '우울' },
  { id: '불안', label: '불안' },
  { id: '스트레스', label: '스트레스' },
]

const ICON_MAP: Record<MindContent['icon'], Icon> = {
  moon: Moon,
  sun: Sun,
  heart: Heart,
  sparkle: Sparkle,
}

const DAILY_CHECKS = [
  { id: 'sleep', label: '오늘 충분히 잠을 잤나요?' },
  { id: 'meal', label: '식사는 잘 하고 있나요?' },
] as const

const CHECK_ACTIONS: {
  id: string
  title: string
  body: string
  Icon: Icon
  route: '/mind-report' | '/support'
}[] = [
  {
    id: 'report',
    title: '지나온 마음 기록',
    body: '자가진단 결과 히스토리를 한눈에 살펴봐요',
    Icon: ChartBar,
    route: '/mind-report',
  },
  {
    id: 'counsel',
    title: '전문 상담 연결',
    body: '필요할 때 상담·긴급 연락처로 바로 연결해요',
    Icon: Headset,
    route: '/support',
  },
]

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function avgScorePct(list: MindCheckResultRecord[]): number | null {
  if (list.length === 0) return null
  const sum = list.reduce((acc, r) => {
    const max = r.max > 0 ? r.max : 1
    return acc + (r.score / max) * 100
  }, 0)
  return Math.round(sum / list.length)
}

function openContent(id: string) {
  router.push({ pathname: '/mind-content', params: { id } })
}

export default function MindScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const [tab, setTab] = useState<TabId>('fill')
  const [filter, setFilter] = useState<MindMoodFilter>('all')
  const [dailyDone, setDailyDone] = useState<Record<string, boolean>>({
    sleep: false,
    meal: false,
  })
  const [results, setResults] = useState<MindCheckResultRecord[]>([])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void getMindCheckResults().then((list) => {
        if (alive) setResults(list)
      })
      return () => {
        alive = false
      }
    }, []),
  )

  const list = useMemo(() => {
    if (filter === 'all') return MIND_CONTENTS
    return MIND_CONTENTS.filter((c) => c.mood === filter)
  }, [filter])

  const dailyChecked = Object.values(dailyDone).filter(Boolean).length

  const weekStats = useMemo(() => {
    const now = Date.now()
    const thisWeek = results.filter(
      (r) => now - new Date(r.at).getTime() < WEEK_MS,
    )
    const lastWeek = results.filter((r) => {
      const age = now - new Date(r.at).getTime()
      return age >= WEEK_MS && age < WEEK_MS * 2
    })
    const thisPct = avgScorePct(thisWeek)
    const lastPct = avgScorePct(lastWeek)
    const delta =
      thisPct != null && lastPct != null ? thisPct - lastPct : null
    return { thisPct, delta, hasAny: results.length > 0 }
  }, [results])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'fill' ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${MIND_FEATURED.title} 재생`}
              onPress={() => openContent(MIND_FEATURED.id)}
              style={({ pressed }) => [
                styles.featured,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.featuredBadges}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>오늘의 추천</Text>
                </View>
                <View style={styles.badgeSecondary}>
                  <Text style={styles.badgeSecondaryText}>대표 콘텐츠</Text>
                </View>
              </View>
              <View style={styles.featuredBottom}>
                <View style={styles.featuredCopy}>
                  <Text style={styles.featuredTitle}>{MIND_FEATURED.title}</Text>
                  <Text style={styles.featuredMeta}>
                    {MIND_FEATURED.mood} · {MIND_FEATURED.minutes}분
                  </Text>
                </View>
                <View style={styles.playBtn}>
                  <Play size={22} color={Colors.primary} weight="fill" />
                </View>
              </View>
            </Pressable>

            <Text style={styles.sectionLabel}>보고 들으며 마음을 채워요</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {FILTERS.map((f) => {
                const on = filter === f.id
                return (
                  <Pressable
                    key={f.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setFilter(f.id)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {f.label}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <View style={styles.listCard}>
              {list.length === 0 ? (
                <Text style={styles.emptyText}>해당 카테고리 콘텐츠가 없어요.</Text>
              ) : (
                list.map((item, i) => {
                  const IconComp = ICON_MAP[item.icon]
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}
                      onPress={() => openContent(item.id)}
                      style={({ pressed }) => [
                        styles.row,
                        i < list.length - 1 && styles.rowDivider,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowIcon}>
                        <IconComp
                          size={20}
                          color={Colors.textPrimary}
                          weight="regular"
                        />
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.rowMeta}>
                          {item.mood} · {item.minutes}분
                        </Text>
                      </View>
                      <CaretRight
                        size={16}
                        color={Colors.textDisabled}
                        weight="bold"
                      />
                    </Pressable>
                  )
                })
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreCardTitle}>오늘의 자가검진</Text>
              <View style={styles.dailyList}>
                {DAILY_CHECKS.map((item) => {
                  const on = !!dailyDone[item.id]
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      onPress={() =>
                        setDailyDone((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      style={styles.dailyRow}
                    >
                      {on ? (
                        <CheckCircle
                          size={22}
                          color={Colors.taupe}
                          weight="fill"
                        />
                      ) : (
                        <RadioButton
                          size={22}
                          color={Colors.sand}
                          weight="regular"
                        />
                      )}
                      <Text
                        style={[
                          styles.dailyLabel,
                          on && styles.dailyLabelOn,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <View style={styles.scoreBlock}>
                {weekStats.thisPct != null ? (
                  <>
                    <View style={styles.scoreTop}>
                      <Text style={styles.scoreLabel}>이번 주 마음 점수</Text>
                      <Text style={styles.scoreValue}>{weekStats.thisPct}</Text>
                    </View>
                    <View style={styles.scoreTrack}>
                      <View
                        style={[
                          styles.scoreFill,
                          {
                            width: `${Math.min(100, Math.max(0, weekStats.thisPct))}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.compareRow}>
                      <Text style={styles.compareLabel}>지난 주 대비</Text>
                      <Text style={styles.compareValue}>
                        {weekStats.delta == null
                          ? '—'
                          : `${weekStats.delta > 0 ? '+' : ''}${weekStats.delta}점`}
                      </Text>
                    </View>
                    <Text style={styles.compareHint}>
                      {dailyChecked}/{DAILY_CHECKS.length} 체크 · 검사 점수
                      평균(높을수록 부담이 클 수 있어요)
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scoreEmptyTitle}>
                      {weekStats.hasAny
                        ? '이번 주 검사가 아직 없어요'
                        : '아직 검사 기록이 없어요'}
                    </Text>
                    <Text style={styles.scoreEmptyBody}>
                      스스로 체크하기로 마음을 살펴보면 여기에 점수가 쌓여요.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="검사하러 가기"
                      onPress={() =>
                        router.push({
                          pathname: '/mind-check-intro',
                          params: { id: 'phq' },
                        })
                      }
                      style={({ pressed }) => [
                        styles.scoreEmptyCta,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.scoreEmptyCtaText}>검사하러 가기</Text>
                      <CaretRight
                        size={16}
                        color={Colors.primary}
                        weight="bold"
                      />
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            <Text style={styles.sectionLabel}>스스로 체크하기</Text>
            <View style={styles.listCard}>
              {MIND_CHECKS.map((check, i) => (
                <Pressable
                  key={check.id}
                  accessibilityRole="button"
                  accessibilityLabel={check.title}
                  onPress={() =>
                    router.push({
                      pathname: '/mind-check-intro',
                      params: { id: check.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.actionRow,
                    i < MIND_CHECKS.length - 1 && styles.rowDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.actionNum}>
                    <ClipboardText
                      size={18}
                      color={Colors.selected}
                      weight="regular"
                    />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{check.title}</Text>
                    <Text style={styles.rowMeta}>
                      {check.sub} · 약 {check.minutes}분
                    </Text>
                  </View>
                  <CaretRight
                    size={16}
                    color={Colors.textDisabled}
                    weight="bold"
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
              마음을 살펴보는 방법
            </Text>
            <View style={styles.listCard}>
              {CHECK_ACTIONS.map((action, i) => (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={action.title}
                  onPress={() => router.push(action.route)}
                  style={({ pressed }) => [
                    styles.actionRow,
                    i < CHECK_ACTIONS.length - 1 && styles.rowDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.actionNum}>
                    <Text style={styles.actionNumText}>{i + 1}</Text>
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{action.title}</Text>
                    <Text style={styles.rowMeta}>{action.body}</Text>
                  </View>
                  <action.Icon
                    size={20}
                    color={Colors.textSecondary}
                    weight="regular"
                  />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 17,
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 16,
  },
  featured: {
    borderRadius: 20,
    backgroundColor: Colors.cocoa,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    minHeight: 168,
    justifyContent: 'space-between',
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
  featuredBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgePrimary: {
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgePrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeSecondary: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  featuredBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featuredMeta: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipOn: {
    backgroundColor: Colors.selected,
    borderColor: Colors.selected,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextOn: {
    color: '#FFFFFF',
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 68,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  pressed: {
    opacity: 0.9,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 24,
    ...Shadows.elevation,
  },
  scoreCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  dailyList: {
    gap: 12,
    marginBottom: 18,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dailyLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dailyLabelOn: {
    color: Colors.textPrimary,
  },
  scoreBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingTop: 16,
  },
  scoreTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  scoreTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.peach,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compareLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  compareValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  compareHint: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  scoreEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  scoreEmptyBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  scoreEmptyCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreEmptyCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 76,
  },
  actionNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.selected,
  },
})
