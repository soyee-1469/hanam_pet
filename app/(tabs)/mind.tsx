import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {
  CaretRight,
  Heart,
  Lightning,
  Moon,
  Play,
  Sparkle,
  Sun,
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
  formatResultDateYmd,
  getMindCheckResults,
  type MindCheckResultRecord,
} from '../../lib/mindCheckResults'
import { CoachmarkTourCard } from '../../components/CoachmarkTourCard'
import { PET_TOUR_STEPS, petTourHref } from '../../lib/coachmarkTour'
import {
  finishPetTourWithComplete,
  getPetTourStepIndex,
  setPetTourStepIndex,
  subscribePetTour,
} from '../../lib/coachmarkTourState'
import { setCoachmarkWelcomeStatus } from '../../lib/coachmarkStorage'
import { getPetName } from '../../lib/petProfile'

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

const CHECK_ICON: Record<MindCheckItem['icon'], Icon> = {
  moon: Moon,
  heart: Heart,
  lightning: Lightning,
}

type MindCheckItem = (typeof MIND_CHECKS)[number]

function openContent(id: string) {
  router.push({ pathname: '/mind-content', params: { id } })
}

function latestForCheck(
  results: MindCheckResultRecord[],
  id: MindCheckItem['id'],
) {
  return results.find((r) => r.assessmentId === id) ?? null
}

export default function MindScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const params = useLocalSearchParams<{ segment?: string }>()
  const initialSegment =
    params.segment === 'check' || params.segment === 'fill'
      ? params.segment
      : 'fill'
  const [tab, setTab] = useState<TabId>(initialSegment)
  const [filter, setFilter] = useState<MindMoodFilter>('all')
  const [results, setResults] = useState<MindCheckResultRecord[]>([])
  const [petName, setPetName] = useState('하치')
  const [tourIndex, setTourIndex] = useState<number | null>(
    getPetTourStepIndex(),
  )

  const tourStep =
    tourIndex != null ? PET_TOUR_STEPS[tourIndex] : undefined
  const showMindTour = tourStep?.route === 'mind'
  const tourHighlightCheck =
    showMindTour && tourStep?.highlight === 'checkTool'

  useEffect(() => {
    return subscribePetTour(() => {
      setTourIndex(getPetTourStepIndex())
    })
  }, [])

  useEffect(() => {
    void getPetName().then((n) => {
      if (n) setPetName(n)
    })
  }, [])

  useEffect(() => {
    if (showMindTour) setTab('check')
  }, [showMindTour])

  const finishPetTour = async () => {
    finishPetTourWithComplete()
    await setCoachmarkWelcomeStatus('accepted')
    router.replace('/(tabs)')
  }

  const onPetTourNext = () => {
    if (tourIndex == null) return
    const next = tourIndex + 1
    if (next < PET_TOUR_STEPS.length) {
      const step = PET_TOUR_STEPS[next]
      setPetTourStepIndex(next)
      if (step.route !== 'mind') {
        router.push(petTourHref(step.route) as never)
      }
      return
    }
    void finishPetTour()
  }

  useFocusEffect(
    useCallback(() => {
      if (params.segment === 'check' || params.segment === 'fill') {
        setTab(params.segment)
      }
      let alive = true
      void getMindCheckResults().then((list) => {
        if (alive) setResults(list)
      })
      return () => {
        alive = false
      }
    }, [params.segment]),
  )

  const list = useMemo(() => {
    if (filter === 'all') return MIND_CONTENTS
    return MIND_CONTENTS.filter((c) => c.mood === filter)
  }, [filter])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마음챙김</Text>
        <Text style={styles.headerSubtitle}>
          {tab === 'fill'
            ? '추천 콘텐츠로 하루를 채워봐요'
            : '자가검진으로 상태를 살펴봐요'}
        </Text>
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t.id
            return (
              <Pressable
                key={t.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setTab(t.id)}
                style={({ pressed }) => [
                  styles.tabBtn,
                  pressed && styles.tabPressed,
                ]}
              >
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>
                  {t.label}
                </Text>
                {on ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            )
          })}
        </View>
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
            <View style={styles.checkNotice}>
              <Text style={styles.checkNoticeText}>
                자신의 증상을 직접 확인하고 작성한 자가보고식 평가 결과는
                참고용으로, 의학적 진단을 대체하지 않아요.
              </Text>
            </View>

            <Text style={styles.sectionLabel}>내 마음을 들여다 봐요</Text>
            <View style={styles.checkList}>
              {MIND_CHECKS.map((check) => {
                const IconComp = CHECK_ICON[check.icon]
                const latest = latestForCheck(results, check.id)
                const highlight =
                  tourHighlightCheck && check.id === MIND_CHECKS[0]?.id
                return (
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
                      styles.checkCard,
                      highlight && styles.checkCardTour,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.checkIconWrap}>
                      <IconComp
                        size={22}
                        color={Colors.primary}
                        weight="regular"
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{check.title}</Text>
                      <Text style={styles.rowMeta}>
                        {check.code} · {check.questions}문항 · 약 {check.minutes}
                        분
                      </Text>
                      <Text style={styles.checkHistory}>
                        {latest
                          ? `최근 평가 ${formatResultDateYmd(latest.at)}`
                          : '검사 이력 없음'}
                      </Text>
                    </View>
                    <CaretRight
                      size={16}
                      color={Colors.textDisabled}
                      weight="bold"
                    />
                  </Pressable>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      {showMindTour && tourStep ? (
        <View style={styles.coachOverlay} pointerEvents="box-none">
          <View style={styles.coachScrim} />
          {tourHighlightCheck ? (
            <View
              style={styles.tourSpotlight}
              pointerEvents="none"
              accessibilityElementsHidden
            >
              <View style={styles.checkIconWrap}>
                <Moon size={22} color={Colors.primary} weight="regular" />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>
                  {MIND_CHECKS[0]?.title ?? '우울 평가도구'}
                </Text>
                <Text style={styles.rowMeta}>
                  {MIND_CHECKS[0]
                    ? `${MIND_CHECKS[0].code} · ${MIND_CHECKS[0].questions}문항 · 약 ${MIND_CHECKS[0].minutes}분`
                    : ''}
                </Text>
              </View>
              <CaretRight
                size={16}
                color={Colors.textDisabled}
                weight="bold"
              />
            </View>
          ) : null}
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={Math.max(insets.bottom, 12) + 24}
          />
        </View>
      ) : null}
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.headerPaddingTop,
  },
  headerTitle: {
    paddingHorizontal: Layout.screenPaddingH,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    paddingHorizontal: Layout.screenPaddingH,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    paddingTop: 2,
    paddingBottom: 12,
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.85,
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerContentGap,
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
  checkNotice: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  checkNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  checkList: {
    gap: 10,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...Shadows.elevation,
  },
  checkCardTour: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  checkIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkHistory: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
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
  coachOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 28,
  },
  coachScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  tourSpotlight: {
    position: 'absolute',
    top: 168,
    left: Layout.screenPaddingH,
    right: Layout.screenPaddingH,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
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
