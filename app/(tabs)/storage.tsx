import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, ChatCircle, Lightning, Notebook } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  ENERGY_MAX,
  FOOD_MAX,
  TOY_MAX,
  loadPetStock,
} from '../../lib/petStock'

type StockKind = 'food' | 'toy' | 'energy'

/** 교감·돌봄 기록만 타임라인에 노출. claim은 날짜 요약으로만 */
type HistoryCategory = 'chat' | 'meal' | 'play' | 'diary' | 'claim' | 'attend'

type HistoryEntry = {
  id: string
  category: HistoryCategory
  story: string
  time: string
  delta: number
  kind: StockKind
}

type StockMap = Record<StockKind, number>

const STOCK_FALLBACK: StockMap = {
  food: 1,
  toy: 3,
  energy: 20,
}

const STOCK_META: { key: StockKind; label: string; max: number }[] = [
  { key: 'food', label: '사료', max: FOOD_MAX },
  { key: 'toy', label: '장난감', max: TOY_MAX },
  { key: 'energy', label: '기운', max: ENERGY_MAX },
]

const HISTORY: HistoryEntry[] = [
  {
    id: '1',
    category: 'chat',
    story: '몽이와 깊은 대화를 나눴어요',
    time: '2026-07-08 14:20:28',
    delta: -1,
    kind: 'energy',
  },
  {
    id: '2',
    category: 'meal',
    story: '몽이가 맛있는 식사를 했어요',
    time: '2026-07-08 14:18:14',
    delta: 2,
    kind: 'energy',
  },
  {
    id: '3',
    category: 'play',
    story: '함께 놀며 기운이 올랐어요',
    time: '2026-07-08 10:05:12',
    delta: 4,
    kind: 'energy',
  },
  {
    id: '4',
    category: 'diary',
    story: '마음을 적으니 몽이도 든든해해요',
    time: '2026-07-08 10:00:16',
    delta: 2,
    kind: 'energy',
  },
  {
    id: '5',
    category: 'claim',
    story: '사료를 챙겨 두었어요',
    time: '2026-07-08 09:12:04',
    delta: 1,
    kind: 'food',
  },
  {
    id: '6',
    category: 'claim',
    story: '장난감을 챙겨 두었어요',
    time: '2026-07-08 09:12:04',
    delta: 1,
    kind: 'toy',
  },
  {
    id: '7',
    category: 'attend',
    story: '오늘도 나와 줘서 반가워요',
    time: '2026-07-08 08:00:16',
    delta: 0,
    kind: 'energy',
  },
  {
    id: '8',
    category: 'meal',
    story: '몽이에게 밥을 줬어요',
    time: '2026-07-07 21:05:12',
    delta: -1,
    kind: 'food',
  },
  {
    id: '9',
    category: 'play',
    story: '장난감으로 함께 놀았어요',
    time: '2026-07-07 20:40:08',
    delta: -1,
    kind: 'toy',
  },
]

function toCount(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v))
  }
  if (v && typeof v === 'object' && 'have' in v) {
    const n = Number((v as { have: unknown }).have)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

function parseStamp(raw: string) {
  const m = raw.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/)
  if (!m) return null
  return {
    dateKey: `${m[1]}-${m[2]}-${m[3]}`,
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
  }
}

function weekdayKo(year: number, month: number, day: number) {
  const names = ['일', '월', '화', '수', '목', '금', '토']
  return names[new Date(year, month - 1, day).getDay()]
}

function formatDelta(delta: number) {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return null
}

/** 기록 수치 — 문장 다음, 옅게만 */
const DELTA_MUTED = '#C4B5A8'

type TimelineItem = {
  id: string
  story: string
  category: HistoryCategory
  kind: StockKind
  delta: number
}

type DateGroup = {
  key: string
  title: string
  weekday: string
  items: TimelineItem[]
}

function buildTimeline(entries: HistoryEntry[]): DateGroup[] {
  const byDate = new Map<
    string,
    {
      meta: { year: number; month: number; day: number }
      moments: HistoryEntry[]
    }
  >()

  for (const entry of entries) {
    const p = parseStamp(entry.time)
    if (!p) continue
    // 챙기기(claim) 로그는 리스트에 노출하지 않음
    if (entry.category === 'claim') continue

    let bucket = byDate.get(p.dateKey)
    if (!bucket) {
      bucket = {
        meta: { year: p.year, month: p.month, day: p.day },
        moments: [],
      }
      byDate.set(p.dateKey, bucket)
    }
    bucket.moments.push(entry)
  }

  const dates: DateGroup[] = []

  for (const [dateKey, bucket] of byDate) {
    if (bucket.moments.length === 0) continue

    dates.push({
      key: dateKey,
      title: `${bucket.meta.month}월 ${bucket.meta.day}일`,
      weekday: `${weekdayKo(bucket.meta.year, bucket.meta.month, bucket.meta.day)}요일`,
      items: bucket.moments.map((entry) => ({
        id: entry.id,
        story: entry.story,
        category: entry.category,
        kind: entry.kind,
        delta: entry.delta,
      })),
    })
  }

  return dates
}

function StockIcon({ kind, size = 26 }: { kind: StockKind; size?: number }) {
  if (kind === 'energy') {
    return <Lightning size={size} color={Colors.accent} weight="fill" />
  }
  return (
    <Image
      source={
        kind === 'food'
          ? require('../../assets/images/bowl.png')
          : require('../../assets/images/toy.png')
      }
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  )
}

function CategoryIcon({
  category,
  kind,
}: {
  category: HistoryCategory
  kind: StockKind
}) {
  const color = Colors.selected
  const size = 18
  switch (category) {
    case 'chat':
      return <ChatCircle size={size} color={color} weight="fill" />
    case 'meal':
      return <StockIcon kind="food" size={20} />
    case 'play':
      return <StockIcon kind="toy" size={20} />
    case 'diary':
      return <Notebook size={size} color={color} weight="fill" />
    case 'attend':
      return <Lightning size={size} color={Colors.accent} weight="fill" />
    case 'claim':
      return kind === 'toy' ? (
        <StockIcon kind="toy" size={20} />
      ) : (
        <StockIcon kind="food" size={20} />
      )
    default:
      return <Lightning size={size} color={color} weight="fill" />
  }
}

export default function StorageScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const [stock, setStock] = useState(STOCK_FALLBACK)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void loadPetStock().then((s) => {
        if (!alive) return
        setStock({ food: s.food, toy: s.toy, energy: s.energy })
      })
      return () => {
        alive = false
      }
    }, []),
  )

  const groups = useMemo(() => buildTimeline(HISTORY), [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.title}>보관함</Text>
        <View style={styles.sideBtn} />
      </View>
      <Text style={styles.subtitle}>지금 가진 것과, 함께한 순간들</Text>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stockRow}>
          {STOCK_META.map((item) => {
            const have = toCount(stock[item.key])
            const ratio =
              item.max > 0 ? Math.min(1, Math.max(0, have / item.max)) : 0
            return (
              <View key={item.key} style={styles.stockCell}>
                <View style={styles.stockIconWrap}>
                  <StockIcon kind={item.key} />
                </View>
                <Text style={styles.stockLabel}>{item.label}</Text>
                <Text style={styles.stockHave}>{have}</Text>
                <View style={styles.stockTrack}>
                  <View
                    style={[
                      styles.stockFill,
                      { width: `${Math.round(ratio * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            )
          })}
        </View>
        <Text style={styles.stockHint}>
          기운은 몽이와 대화할 때 써요. 돌보면 다시 채워져요.
        </Text>

        <View style={styles.historyBlock}>
          <Text style={styles.sectionLabel}>함께한 기록</Text>

          {groups.map((dateGroup, dateIndex) => (
            <View
              key={dateGroup.key}
              style={[
                styles.dateBlock,
                dateIndex > 0 && styles.dateBlockSpaced,
              ]}
            >
              <Text style={styles.dateLine}>
                {dateGroup.title}
                <Text style={styles.dateWeekday}> · {dateGroup.weekday}</Text>
              </Text>

              <View style={styles.eventBox}>
                {dateGroup.items.map((item, index) => {
                  const deltaLabel = formatDelta(item.delta)
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.eventRow,
                        index > 0 && styles.eventRowDivider,
                      ]}
                    >
                      <View style={styles.eventIcon}>
                        <CategoryIcon
                          category={item.category}
                          kind={item.kind}
                        />
                      </View>
                      <Text style={styles.eventStory}>{item.story}</Text>
                      {deltaLabel ? (
                        <Text style={styles.eventDelta}>{deltaLabel}</Text>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: 4,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    paddingHorizontal: Layout.screenPaddingH,
    marginBottom: Layout.headerContentGap,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  stockCell: {
    alignItems: 'center',
    minWidth: 72,
  },
  stockIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  stockHave: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 8,
  },
  stockTrack: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.selected,
  },
  stockHint: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  historyBlock: {
    marginTop: 32,
  },
  sectionLabel: {
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateBlock: {
    paddingBottom: 4,
  },
  dateBlockSpaced: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  dateLine: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  dateWeekday: {
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  eventBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 56,
  },
  eventRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventStory: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 32,
    includeFontPadding: false,
    paddingRight: 8,
  },
  eventDelta: {
    fontSize: 13,
    fontWeight: '600',
    color: DELTA_MUTED,
    minWidth: 32,
    textAlign: 'right',
    lineHeight: 32,
    includeFontPadding: false,
    marginRight: 2,
  },
})
