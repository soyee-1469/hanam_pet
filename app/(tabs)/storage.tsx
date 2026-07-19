import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, ChatCircle, Lightning, Notebook } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { Fonts } from '../../constants/Typography'
import {
  ENERGY_DAILY_EARN_CAP,
  ENERGY_MAX,
  FOOD_MAX,
  TOY_MAX,
  energyBarColor,
  loadPetDailyState,
  loadPetStock,
} from '../../lib/petStock'
import {
  CLAIM_MAX_PER_DAY,
  loadPetClaimState,
} from '../../lib/petClaimCooldown'

type StockKind = 'food' | 'toy' | 'energy'
type HistoryTab = 'item' | 'energy'
type HistoryCategory = 'chat' | 'meal' | 'play' | 'diary' | 'claim' | 'attend' | 'use'

type HistoryEntry = {
  id: string
  tab: HistoryTab
  category: HistoryCategory
  title: string
  time: string
  delta: number
  kind: StockKind
}

type StockMap = Record<StockKind, number>

const STOCK_FALLBACK: StockMap = {
  food: 3,
  toy: 2,
  energy: 48,
}

const TODAY_GAIN_MAX: StockMap = {
  food: CLAIM_MAX_PER_DAY,
  toy: CLAIM_MAX_PER_DAY,
  energy: ENERGY_DAILY_EARN_CAP,
}

const STOCK_COLS: {
  key: StockKind
  label: string
  max: number
  unit: string
}[] = [
  { key: 'food', label: '사료', max: FOOD_MAX, unit: '개' },
  { key: 'toy', label: '장난감', max: TOY_MAX, unit: '개' },
  { key: 'energy', label: '에너지', max: ENERGY_MAX, unit: '개' },
]

/** 시안 my-activity-items-tab */
const HISTORY: HistoryEntry[] = [
  {
    id: 'i1',
    tab: 'item',
    category: 'use',
    title: '사료 주기',
    time: '2026-07-08 14:20:28',
    delta: -1,
    kind: 'food',
  },
  {
    id: 'i2',
    tab: 'item',
    category: 'play',
    title: '놀아 주기',
    time: '2026-07-08 14:18:14',
    delta: -1,
    kind: 'toy',
  },
  {
    id: 'i3',
    tab: 'item',
    category: 'play',
    title: '놀아 주기',
    time: '2026-07-08 10:05:12',
    delta: -1,
    kind: 'toy',
  },
  {
    id: 'i4',
    tab: 'item',
    category: 'claim',
    title: '장난감 받기',
    time: '2026-07-08 10:00:16',
    delta: 1,
    kind: 'toy',
  },
  {
    id: 'i5',
    tab: 'item',
    category: 'claim',
    title: '사료 받기',
    time: '2026-07-08 08:00:16',
    delta: 1,
    kind: 'food',
  },
  {
    id: 'e1',
    tab: 'energy',
    category: 'chat',
    title: '대화 하기',
    time: '2026-07-08 14:20:28',
    delta: -1,
    kind: 'energy',
  },
  {
    id: 'e2',
    tab: 'energy',
    category: 'meal',
    title: '사료 주기',
    time: '2026-07-08 14:18:14',
    delta: 2,
    kind: 'energy',
  },
  {
    id: 'e3',
    tab: 'energy',
    category: 'play',
    title: '놀아 주기',
    time: '2026-07-08 10:05:12',
    delta: 4,
    kind: 'energy',
  },
  {
    id: 'e4',
    tab: 'energy',
    category: 'diary',
    title: '마음일기 작성',
    time: '2026-07-08 10:00:16',
    delta: 2,
    kind: 'energy',
  },
  {
    id: 'e5',
    tab: 'energy',
    category: 'attend',
    title: '출석 도장',
    time: '2026-07-08 08:00:16',
    delta: 0,
    kind: 'energy',
  },
]

const TABS: { key: HistoryTab; label: string }[] = [
  { key: 'item', label: '아이템' },
  { key: 'energy', label: '에너지' },
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

function formatDelta(delta: number, unit: string) {
  if (delta > 0) return `+${delta}${unit}`
  if (delta < 0) return `${delta}${unit}`
  return `0${unit}`
}

/** "2026-07-08 14:20:28" → "7월 8일 14:20" */
function formatHistoryTime(raw: string) {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/)
  if (!m) return raw
  const month = Number(m[2])
  const day = Number(m[3])
  return `${month}월 ${day}일 ${m[4]}:${m[5]}`
}

function StockIcon({
  kind,
  size = 28,
  empty = false,
}: {
  kind: StockKind
  size?: number
  empty?: boolean
}) {
  if (kind === 'energy') {
    return (
      <Lightning
        size={size}
        color={Colors.accent}
        weight="fill"
        style={empty ? { opacity: 0.38 } : undefined}
      />
    )
  }
  if (kind === 'food' && empty) {
    return (
      <Image
        source={require('../../assets/images/null-bowl.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    )
  }
  return (
    <Image
      source={
        kind === 'food'
          ? require('../../assets/images/bowl.png')
          : require('../../assets/images/toy.png')
      }
      style={[
        { width: size, height: size },
        empty && kind === 'toy' ? { opacity: 0.38 } : null,
      ]}
      resizeMode="contain"
    />
  )
}

function CategoryIcon({
  category,
  kind,
  energyTab = false,
}: {
  category: HistoryCategory
  kind: StockKind
  energyTab?: boolean
}) {
  if (energyTab || kind === 'energy') {
    return <Lightning size={20} color={Colors.accent} weight="fill" />
  }
  const color = Colors.selected
  const size = 18
  switch (category) {
    case 'chat':
      return <ChatCircle size={size} color={color} weight="fill" />
    case 'meal':
    case 'use':
      return kind === 'toy' ? (
        <StockIcon kind="toy" size={20} />
      ) : (
        <StockIcon kind="food" size={20} />
      )
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

function iconWellBg(kind: StockKind, empty: boolean) {
  if (kind === 'energy') return Colors.accentSoft
  if (empty) return Colors.surfaceSecondary
  if (kind === 'food') return Colors.iconFeed
  return Colors.iconToy
}

function stockFillColor(kind: StockKind) {
  if (kind === 'energy') return Colors.energyFill
  return Colors.selected
}

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function StorageScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const [stock, setStock] = useState(STOCK_FALLBACK)
  const [todayGain, setTodayGain] = useState<StockMap>({
    food: 0,
    toy: 0,
    energy: 0,
  })
  const [tab, setTab] = useState<HistoryTab>('item')

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void (async () => {
        const [s, daily, claims] = await Promise.all([
          loadPetStock(),
          loadPetDailyState(),
          loadPetClaimState(),
        ])
        if (!alive) return
        setStock({ food: s.food, toy: s.toy, energy: s.energy })
        setTodayGain({
          food: claims.feed.count,
          toy: claims.toy.count,
          energy: daily.energyEarned,
        })
      })()
      return () => {
        alive = false
      }
    }, []),
  )

  const entries = useMemo(
    () => HISTORY.filter((e) => e.tab === tab),
    [tab],
  )

  const switchTab = (next: HistoryTab) => {
    if (next === tab) return
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setTab(next)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.title}>보관함</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stockRow}>
          {STOCK_COLS.map((col) => {
            const have = toCount(stock[col.key])
            const empty = have === 0
            const ratio = Math.min(1, have / col.max)
            const isEnergy = col.key === 'energy'
            const fill = isEnergy ? energyBarColor(have) : stockFillColor(col.key)
            return (
              <View
                key={col.key}
                style={[styles.stockCard, empty && styles.stockCardEmpty]}
                accessibilityRole="summary"
                accessibilityLabel={`${col.label} ${have} / ${col.max}${col.unit}`}
              >
                <View
                  style={[
                    styles.stockIconWell,
                    { backgroundColor: iconWellBg(col.key, empty) },
                  ]}
                >
                  <StockIcon kind={col.key} size={28} empty={empty} />
                </View>
                <Text style={styles.stockLabel}>{col.label}</Text>
                <Text style={styles.stockValue}>
                  <Text
                    style={[
                      styles.stockHave,
                      isEnergy && styles.stockHaveEnergy,
                      empty && styles.stockHaveEmpty,
                    ]}
                  >
                    {have}
                  </Text>
                  <Text style={styles.stockMax}>{` / ${col.max}`}</Text>
                </Text>
                <View style={styles.stockTrack}>
                  <View
                    style={[
                      styles.stockFill,
                      {
                        width: `${Math.round(ratio * 100)}%`,
                        backgroundColor: empty ? Colors.sand : fill,
                      },
                    ]}
                  />
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.todayBlock}>
          <Text style={styles.todayTitle}>오늘 받았어요</Text>
          <View style={styles.todayRow}>
            {STOCK_COLS.map((col) => {
              const gained = todayGain[col.key]
              const cap = TODAY_GAIN_MAX[col.key]
              const isEnergy = col.key === 'energy'
              const full = gained >= cap
              return (
                <View key={`gain-${col.key}`} style={styles.todayChip}>
                  <Text style={styles.todayChipLabel}>{col.label}</Text>
                  <Text style={styles.todayChipValue}>
                    <Text
                      style={[
                        styles.todayChipHave,
                        isEnergy && styles.todayChipHaveEnergy,
                      ]}
                    >
                      {gained}
                    </Text>
                    {` / ${cap}`}
                  </Text>
                  <Text style={styles.todayChipCap}>
                    {full
                      ? '오늘 한도예요'
                      : `${cap - gained}개 더 받을 수 있어요`}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => switchTab(t.key)}
                style={({ pressed }) => [
                  styles.tabItem,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t.label}
                </Text>
                <View
                  style={[styles.tabUnderline, active && styles.tabUnderlineOn]}
                />
              </Pressable>
            )
          })}
        </View>

        {entries.length === 0 ? (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyTitle}>
              {tab === 'energy' ? '에너지 기록이 없어요' : '아이템 기록이 없어요'}
            </Text>
            <Text style={styles.historyEmptyBody}>
              {tab === 'energy'
                ? '돌보면 여기에 쌓여요.'
                : '주고받으면 여기에 쌓여요.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {entries.map((item, index) => {
              const deltaLabel = formatDelta(item.delta, '개')
              const positive = item.delta > 0
              const zero = item.delta === 0
              const isEnergy = tab === 'energy'
              return (
                <View
                  key={item.id}
                  style={[styles.row, index > 0 ? styles.rowDivider : null]}
                >
                  <View
                    style={[styles.rowIcon, isEnergy && styles.rowIconEnergy]}
                  >
                    <CategoryIcon
                      category={item.category}
                      kind={item.kind}
                      energyTab={isEnergy}
                    />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowTime}>
                      {formatHistoryTime(item.time)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.rowDelta,
                      positive &&
                        (isEnergy
                          ? styles.rowDeltaPlusEnergy
                          : styles.rowDeltaPlus),
                      !positive && !zero && styles.rowDeltaMinus,
                      zero && styles.rowDeltaZero,
                    ]}
                  >
                    {deltaLabel}
                  </Text>
                </View>
              )
            })}
          </View>
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
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
    opacity: 0.7,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: 14,
  },
  stockRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stockCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 6,
    gap: 6,
    ...Shadows.elevation,
  },
  stockCardEmpty: {
    backgroundColor: Colors.cardRecessed,
    borderColor: Colors.sand,
    shadowOpacity: 0,
    elevation: 0,
  },
  stockIconWell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockLabel: {
    fontSize: 12,
    fontFamily: Fonts.uiSemiBold,
    color: Colors.textSecondary,
  },
  stockValue: {
    fontSize: 12,
    fontFamily: Fonts.uiMedium,
    color: Colors.textDisabled,
  },
  stockHave: {
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  stockHaveEnergy: {
    color: Colors.accent,
  },
  stockHaveEmpty: {
    color: Colors.textDisabled,
  },
  stockMax: {
    fontSize: 12,
    fontFamily: Fonts.uiMedium,
    color: Colors.textDisabled,
  },
  stockTrack: {
    alignSelf: 'stretch',
    height: 5,
    borderRadius: 999,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 999,
  },
  todayBlock: {
    gap: 10,
  },
  todayTitle: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  todayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  todayChip: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,
  },
  todayChipLabel: {
    fontFamily: Fonts.uiMedium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  todayChipValue: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  todayChipHave: {
    fontFamily: Fonts.uiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  todayChipHaveEnergy: {
    color: Colors.accent,
  },
  todayChipCap: {
    fontFamily: Fonts.uiMedium,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.textDisabled,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: Fonts.uiSemiBold,
    color: Colors.textDisabled,
    marginBottom: 10,
  },
  tabLabelActive: {
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
  },
  tabUnderline: {
    alignSelf: 'stretch',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabUnderlineOn: {
    backgroundColor: Colors.primary,
  },
  list: {
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    minHeight: 56,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconEnergy: {
    borderRadius: 20,
    backgroundColor: Colors.accentSoft,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  rowTime: {
    fontSize: 12,
    fontFamily: Fonts.uiMedium,
    color: Colors.textDisabled,
    fontVariant: ['tabular-nums'],
  },
  rowDelta: {
    fontSize: 14,
    fontFamily: Fonts.uiBold,
    minWidth: 44,
    textAlign: 'right',
  },
  rowDeltaPlus: {
    color: Colors.primary,
  },
  rowDeltaPlusEnergy: {
    color: Colors.accent,
  },
  rowDeltaMinus: {
    color: Colors.textPrimary,
  },
  rowDeltaZero: {
    color: Colors.textSecondary,
  },
  historyEmpty: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 24,
    gap: 4,
  },
  historyEmptyTitle: {
    fontSize: 14,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  historyEmptyBody: {
    fontSize: 13,
    fontFamily: Fonts.uiMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
})
