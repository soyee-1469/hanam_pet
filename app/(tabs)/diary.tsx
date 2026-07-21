import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, CaretRight, Plus } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, HeaderTitleStyle, tabBarReserveHeight } from '../../constants/Layout'
import {
  DIARY_MOODS,
  type DiaryMoodId,
} from '../../constants/Moods'
import { DIARY_MOOD_LABEL_COLOR } from '../../constants/diaryDemo'
import {
  diaryMoodsForMonth,
  countDiaryEntriesByDate,
  hydrateDiaryRecords,
  subscribeDiaryRecords,
} from '../../lib/diaryRecords'
import { MoodEmoji } from '../../components/MoodEmoji'
import { TabSceneGate } from '../../components/TabSceneGate'
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

type DayMood = {
  day: number
  moodId: DiaryMoodId
  /** 그날 기록 수 (2건 이상이면 달력에 +N) */
  count: number
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

function moodMeta(id: DiaryMoodId) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function getMonthMatrix(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function DiaryScreen() {
  return (
    <TabSceneGate>
      <DiaryScreenBody />
    </TabSceneGate>
  )
}

function DiaryScreenBody() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [petName, setPetName] = useState('하치')
  const [tourIndex, setTourIndex] = useState<number | null>(
    getPetTourStepIndex(),
  )

  const tourStep =
    tourIndex != null ? PET_TOUR_STEPS[tourIndex] : undefined
  const showDiaryTour = tourStep?.route === 'diary'
  const tourHighlightWrite =
    showDiaryTour && tourStep?.highlight === 'writeCta'

  const [diaryEpoch, setDiaryEpoch] = useState(0)

  useEffect(() => {
    return subscribePetTour(() => {
      setTourIndex(getPetTourStepIndex())
    })
  }, [])

  useEffect(() => {
    void hydrateDiaryRecords().then(() => setDiaryEpoch((n) => n + 1))
    return subscribeDiaryRecords(() => setDiaryEpoch((n) => n + 1))
  }, [])

  useEffect(() => {
    void getPetName().then((n) => {
      if (n) setPetName(n)
    })
  }, [])

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
      if (step.route !== 'diary') {
        router.push(petTourHref(step.route) as never)
      }
      return
    }
    void finishPetTour()
  }

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const moods = useMemo(
    () => diaryMoodsForMonth(year, month + 1, today),
    [year, month, today, diaryEpoch],
  )
  const moodMap = useMemo(() => {
    const map = new Map<number, DayMood>()
    moods.forEach((m) => map.set(m.day, m))
    return map
  }, [moods])

  const cells = useMemo(() => getMonthMatrix(year, month), [year, month])
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  const dist = useMemo(() => {
    const counts: Record<DiaryMoodId, number> = {
      great: 0,
      good: 0,
      ok: 0,
      bad: 0,
      hard: 0,
    }
    moods.forEach((m) => {
      counts[m.moodId] += 1
    })
    const chips = DIARY_MOODS.filter((m) => counts[m.id] > 0).map((m) => ({
      id: m.id,
      label: m.label,
      emojiIndex: m.emojiIndex,
      count: counts[m.id],
      barColor: DIARY_MOOD_LABEL_COLOR[m.id],
    }))
    const legend = DIARY_MOODS.map((m) => ({
      id: m.id,
      label: m.shortLabel,
      emojiIndex: m.emojiIndex,
      borderColor: DIARY_MOOD_LABEL_COLOR[m.id],
      count: counts[m.id],
    }))
    return {
      count: moods.length,
      chips,
      legend,
    }
  }, [moods])

  const shiftMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDay(1)
  }

  const isFutureDay = (day: number) => {
    const t = startOfDay(new Date(year, month, day))
    return t > startOfDay(today)
  }

  const resolveSelectedYmd = () => {
    const useToday = isFutureDay(selectedDay)
    const y = useToday ? today.getFullYear() : year
    const m = useToday ? today.getMonth() + 1 : month + 1
    const d = useToday ? today.getDate() : selectedDay
    return { y, m, d }
  }

  const openDayList = (day: number) => {
    if (isFutureDay(day)) return
    setSelectedDay(day)
    router.push({
      pathname: '/diary-list',
      params: {
        year: String(year),
        month: String(month + 1),
        day: String(day),
      },
    })
  }

  const selectedDayCount = useMemo(() => {
    const { y, m, d } = resolveSelectedYmd()
    return countDiaryEntriesByDate(y, m, d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, year, month, today, diaryEpoch])

  const openSelectedOrWrite = () => {
    const { y, m, d } = resolveSelectedYmd()
    if (selectedDayCount > 0) {
      router.push({
        pathname: '/diary-list',
        params: {
          year: String(y),
          month: String(m),
          day: String(d),
        },
      })
      return
    }
    router.push({
      pathname: '/diary-write',
      params: {
        year: String(y),
        month: String(m),
        day: String(d),
      },
    })
  }

  const openMonthList = () => {
    router.push({
      pathname: '/diary-list',
      params: {
        year: String(year),
        month: String(month + 1),
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>마음일기</Text>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => shiftMonth(-1)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.monthNav,
              { cursor: 'pointer' } as object,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <CaretLeft size={20} color={Colors.textSecondary} weight="bold" />
          </Pressable>
          <Text style={styles.monthLabel}>
            {year}년 {month + 1}월
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => shiftMonth(1)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.monthNav,
              { cursor: 'pointer' } as object,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <CaretRight size={20} color={Colors.textSecondary} weight="bold" />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={w}
                style={[
                  styles.weekday,
                  i === 0 && styles.weekdaySun,
                ]}
              >
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: cells.length / 7 }, (_, weekIdx) => {
              const week = cells.slice(weekIdx * 7, weekIdx * 7 + 7)
              return (
                <View key={`w-${weekIdx}`} style={styles.weekRow}>
                  {week.map((day, dayIdx) => {
                    const idx = weekIdx * 7 + dayIdx
                    if (day == null) {
                      return <View key={`e-${idx}`} style={styles.dayCell} />
                    }
                    const mood = moodMap.get(day)
                    const future = isFutureDay(day)
                    const selected = !future && day === selectedDay
                    const isToday = isCurrentMonth && day === today.getDate()
                    const emojiIndex = mood ? moodMeta(mood.moodId).emojiIndex : null

                    return (
                      <View key={`d-${day}`} style={styles.dayCell}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            mood
                              ? mood.count > 1
                                ? `${day}일 ${moodMeta(mood.moodId).label} 마음일기 ${mood.count}건`
                                : `${day}일 ${moodMeta(mood.moodId).label} 마음일기`
                              : `${day}일 마음일기 쓰기`
                          }
                          disabled={future}
                          onPress={() => openDayList(day)}
                          style={({ pressed }) => [
                            styles.dayPressable,
                            !future && ({ cursor: 'pointer' } as object),
                            !future && pressed && styles.dayPressed,
                            future && styles.dayFuture,
                          ]}
                        >
                          <View
                            style={[
                              styles.dayInner,
                              selected && styles.daySelected,
                              isToday && styles.dayToday,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayNum,
                                future && styles.dayNumFuture,
                                selected && styles.dayNumSelected,
                                isToday && styles.dayNumToday,
                                !future && !selected && dayIdx === 0 && styles.weekdaySun,
                              ]}
                            >
                              {day}
                            </Text>
                            <View style={styles.dayMoodSlot}>
                              {!future && mood && emojiIndex ? (
                                <>
                                  <MoodEmoji index={emojiIndex} size={18} />
                                  <View
                                    style={[
                                      styles.moodDot,
                                      {
                                        backgroundColor:
                                          DIARY_MOOD_LABEL_COLOR[mood.moodId],
                                      },
                                    ]}
                                  />
                                  {mood.count > 1 ? (
                                    <Text style={styles.moodCountBadge}>
                                      +{mood.count}
                                    </Text>
                                  ) : null}
                                </>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.distCard}>
          <View style={styles.distHeader}>
            <Text style={styles.distTitle} numberOfLines={1}>
              이번 달 하치와 나눈 마음
            </Text>
            <Text style={styles.distCount}>{dist.count}일 기록</Text>
          </View>
          <View style={styles.distBar}>
            {dist.count === 0 ? (
              <View style={[styles.distSeg, styles.distEmpty, { flex: 1 }]} />
            ) : (
              dist.chips.map((chip) => (
                <View
                  key={chip.id}
                  style={[
                    styles.distSeg,
                    { flex: chip.count, backgroundColor: chip.barColor },
                  ]}
                />
              ))
            )}
          </View>

          <View style={styles.legendRow}>
            {dist.legend.map((item) => (
              <View key={item.id} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendEmojiRing,
                    { borderColor: item.borderColor },
                  ]}
                >
                  <MoodEmoji index={item.emojiIndex} size={16} />
                </View>
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {item.label} {item.count}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="기록한 마음일기 보러가기"
            onPress={openMonthList}
            style={({ pressed }) => [
              styles.listLinkRow,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <Text style={styles.listLinkText}>기록한 마음 보러가기</Text>
            <CaretRight size={16} color={Colors.textSecondary} weight="bold" />
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.ctaWrap,
          { paddingBottom: tabBarSpace + 12 },
          tourHighlightWrite && styles.ctaWrapTour,
        ]}
        collapsable={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selectedDayCount > 0 ? '기록 보러갈께요' : '마음을 기록할게요'
          }
          onPress={openSelectedOrWrite}
          style={({ pressed }) => [pressed && styles.ctaPressed]}
        >
          <View
            style={[
              tourHighlightWrite && styles.ctaTourRing,
            ]}
            collapsable={false}
          >
            <View style={styles.cta} collapsable={false}>
              {selectedDayCount > 0 ? null : (
                <Plus size={18} color={Colors.buttonPrimaryText} weight="bold" />
              )}
              <Text style={styles.ctaText}>
                {selectedDayCount > 0
                  ? '기록 보러갈께요'
                  : '마음을 기록할게요'}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {showDiaryTour && tourStep ? (
        <>
          <View style={styles.coachScrimLayer} pointerEvents="auto">
            <View style={styles.coachScrim} />
          </View>
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={Math.max(insets.bottom, 12) + 86}
          />
        </>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    color: Colors.textPrimary,
    ...HeaderTitleStyle.tab,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconBtnPressed: {
    backgroundColor: Colors.divider,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 0,
    paddingBottom: Layout.sectionGapLg,
  },
  ctaWrap: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  /** Above scrim (spotlight); below CoachmarkTourCard (zIndex 40). */
  ctaWrapTour: {
    zIndex: 30,
    elevation: 30,
  },
  coachScrimLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  coachScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 12,
  },
  monthNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  monthLabel: {
    minWidth: 120,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  weekdaySun: {
    color: Colors.primary,
  },
  daysGrid: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
  },
  dayCell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 72,
    minWidth: 0,
  },
  dayPressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayPressed: {
    opacity: 0.85,
  },
  dayFuture: {
    opacity: 0.45,
  },
  dayInner: {
    width: 42,
    height: 66,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  /** Selected (non-today) — primary border, no fill */
  daySelected: {
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  /** Today — soft yellow fill (wins over selected fill) */
  dayToday: {
    backgroundColor: '#FFF6D6',
  },
  dayNum: {
    height: 18,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    zIndex: 1,
  },
  dayNumFuture: {
    color: Colors.textDisabled,
  },
  dayNumSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  dayNumToday: {
    fontWeight: '800',
  },
  dayMoodSlot: {
    minHeight: 30,
    width: 28,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    zIndex: 1,
  },
  /** Inside Out 감정색 점 — 이모지와 함께 날짜별 다양성 표시 */
  moodDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  /** 같은 날 2건 이상 — 색 점 아래 +N */
  moodCountBadge: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  distCard: {
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  distHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  distTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  distCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  distBar: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: Colors.sand,
  },
  distSeg: {
    height: '100%',
    minWidth: 4,
  },
  distEmpty: {
    backgroundColor: Colors.sand,
  },
  legendRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
    minWidth: 0,
  },
  /** 기분 이모지 + 기준색(Inside Out) 테두리 */
  legendEmojiRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  listLinkRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Layout.sectionGap,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  listLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cta: {
    height: 54,
    width: '100%',
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevation,
  },
  ctaTourRing: {
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    padding: 3,
    backgroundColor: 'rgba(255, 143, 122, 0.2)',
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
})
