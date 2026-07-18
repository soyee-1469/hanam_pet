import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, CaretRight, BookOpen, Plus } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  DIARY_MOODS,
  type DiaryMoodId,
} from '../../constants/Moods'
import { DIARY_DEMO_ENTRIES } from '../../constants/diaryDemo'
import { MoodEmoji } from '../../components/MoodEmoji'

type DayMood = {
  day: number
  moodId: DiaryMoodId
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 막대 세그먼트용 파스텔 (5종) — 기쁨·슬픔·분노·걱정·불편 */
const BAR_COLOR: Record<DiaryMoodId, string> = {
  great: '#F5E3A8',
  good: '#C5DFF0',
  ok: '#F7D7B8',
  bad: '#E0D4F0',
  hard: '#E4EBB8',
}

function moodMeta(id: DiaryMoodId) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** 데모용 — 이번 달 일부 날짜에 감정 기록 (5종) */
function buildDemoMoods(year: number, month: number, today: Date): DayMood[] {
  const seed: DayMood[] = [
    { day: 1, moodId: 'great' },
    { day: 2, moodId: 'ok' },
    { day: 3, moodId: 'good' },
    { day: 5, moodId: 'hard' },
    { day: 6, moodId: 'great' },
    { day: 8, moodId: 'bad' },
    { day: 9, moodId: 'ok' },
    { day: 10, moodId: 'good' },
    { day: 12, moodId: 'great' },
    { day: 14, moodId: 'ok' },
    { day: 15, moodId: 'hard' },
    { day: 17, moodId: 'good' },
    { day: 18, moodId: 'great' },
    { day: 20, moodId: 'bad' },
    { day: 22, moodId: 'hard' },
    { day: 24, moodId: 'good' },
    { day: 27, moodId: 'ok' },
  ]
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStart = startOfDay(today)
  return seed.filter((m) => {
    if (m.day > daysInMonth) return false
    const t = startOfDay(new Date(year, month, m.day))
    return t <= todayStart
  })
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

function monthFeedback(good: number, ok: number, hard: number) {
  if (good === 0 && ok === 0 && hard === 0) {
    return '이번 달 이야기를 아직 기다리고 있어요.'
  }
  if (good >= ok && good >= hard) {
    return '이번 달은 웃는 날이 가장 많았어요.'
  }
  if (hard >= good && hard >= ok) {
    return '조금 힘든 날도 있었지만 잘 이겨내고 있어요.'
  }
  return '잔잔한 마음으로 하루하루를 채워가고 있어요.'
}

export default function DiaryScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const moods = useMemo(() => buildDemoMoods(year, month, today), [year, month, today])
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
    let good = 0
    let ok = 0
    let hard = 0
    moods.forEach((m) => {
      counts[m.moodId] += 1
      const tone = moodMeta(m.moodId).tone
      if (tone === 'good') good += 1
      else if (tone === 'ok') ok += 1
      else hard += 1
    })
    const chips = DIARY_MOODS.filter((m) => counts[m.id] > 0).map((m) => ({
      id: m.id,
      label: m.label,
      emojiIndex: m.emojiIndex,
      count: counts[m.id],
      barColor: BAR_COLOR[m.id],
    }))
    const legend = DIARY_MOODS.map((m) => ({
      id: m.id,
      label: m.shortLabel,
      barColor: BAR_COLOR[m.id],
      count: counts[m.id],
    }))
    return {
      count: moods.length,
      chips,
      legend,
      comment: monthFeedback(good, ok, hard),
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

  const openDay = (day: number) => {
    if (isFutureDay(day)) return
    setSelectedDay(day)
    const entry = DIARY_DEMO_ENTRIES.find(
      (e) => e.year === year && e.month === month + 1 && e.day === day,
    )
    if (entry) {
      router.push({
        pathname: '/diary-detail',
        params: { id: entry.id },
      })
      return
    }
    router.push({
      pathname: '/diary-write',
      params: {
        year: String(year),
        month: String(month + 1),
        day: String(day),
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>마음일기</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="마음일기장 보기"
          hitSlop={8}
          onPress={() => router.push('/diary-list')}
          style={({ pressed }) => [
            styles.listEntryBtn,
            pressed && styles.iconBtnPressed,
          ]}
        >
          <BookOpen size={18} color={Colors.textPrimary} weight="regular" />
          <Text style={styles.listEntryText}>일기장</Text>
        </Pressable>
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
                  i === 6 && styles.weekdaySat,
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
                              ? `${day}일 마음일기 보기`
                              : `${day}일 마음일기 쓰기`
                          }
                          disabled={future}
                          onPress={() => openDay(day)}
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
                              isToday && styles.dayToday,
                              selected && styles.daySelected,
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
                              {future ? null : emojiIndex ? (
                                <MoodEmoji index={emojiIndex} size={20} />
                              ) : (
                                <View style={styles.dayDot} />
                              )}
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
              이번 달 몽이와 나눈 마음
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
                >
                  {chip.count > 0 ? (
                    <Text style={styles.distSegNum}>{chip.count}</Text>
                  ) : null}
                </View>
              ))
            )}
          </View>

          {dist.count > 0 ? (
            <View style={styles.legendRow}>
              {dist.legend.map((item) => (
                <View key={item.id} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendSwatch,
                      { backgroundColor: item.barColor },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.feedback}>{dist.comment}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="기록한 마음일기 전체 보기"
            onPress={() => router.push('/diary-list')}
            style={({ pressed }) => [
              styles.listLinkRow,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <Text style={styles.listLinkText}>기록한 마음 모아보기</Text>
            <CaretRight size={16} color={Colors.textSecondary} weight="bold" />
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[styles.ctaWrap, { paddingBottom: tabBarSpace + 12 }]}
        collapsable={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="감정 기록하기"
          onPress={() => {
            const useToday = isFutureDay(selectedDay)
            router.push({
              pathname: '/diary-write',
              params: {
                year: String(useToday ? today.getFullYear() : year),
                month: String(useToday ? today.getMonth() + 1 : month + 1),
                day: String(useToday ? today.getDate() : selectedDay),
              },
            })
          }}
          style={({ pressed }) => [pressed && styles.ctaPressed]}
        >
          <View style={styles.cta} collapsable={false}>
            <Plus size={18} color={Colors.buttonPrimaryText} weight="bold" />
            <Text style={styles.ctaText}>마음을 기록할게요</Text>
          </View>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  listEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listEntryText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  iconBtnPressed: {
    backgroundColor: Colors.divider,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 0,
    paddingBottom: 20,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: Colors.background,
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
    fontSize: 17,
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
  weekdaySat: {
    color: Colors.secondary,
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
    height: 64,
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
    height: 58,
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
  /** Today — soft yellow fill; border may come from daySelected */
  dayToday: {
    backgroundColor: Colors.accentSoft,
  },
  /** Selected — Primary Stroke */
  daySelected: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
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
    height: 24,
    width: 24,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.sand,
  },
  distCard: {
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
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
    height: 28,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: Colors.sand,
  },
  distSeg: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
  },
  distSegNum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  distEmpty: {
    backgroundColor: Colors.sand,
  },
  legendRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    rowGap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  feedback: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  listLinkRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
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
