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
import { CaretDown, CaretLeft, ChatCircle, Lightning, Notebook } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  ENERGY_MAX,
  FOOD_MAX,
  TOY_MAX,
  loadPetStock,
} from '../../lib/petStock'

type StockKind = 'food' | 'toy' | 'energy'
type HistoryTab = 'item' | 'energy'
type HistoryCategory = 'chat' | 'meal' | 'play' | 'diary' | 'claim' | 'attend' | 'use'

type HistoryEntry = {
  id: string
  tab: HistoryTab
  category: HistoryCategory
  title: string
  /** 탭하면 펼쳐지는 추가 멘트 */
  note: string
  time: string
  delta: number
  kind: StockKind
}

type StockMap = Record<StockKind, number>

const STOCK_FALLBACK: StockMap = {
  food: 3,
  toy: 3,
  energy: 12,
}

/** 데모: 오늘 돌봄으로 얻은 양 / 일일 상한 */
const TODAY_GAIN: StockMap = { food: 1, toy: 1, energy: 12 }
const TODAY_GAIN_MAX: StockMap = { food: 2, toy: 2, energy: 20 }

const STOCK_COLS: { key: StockKind; label: string; max: number; unit: string }[] =
  [
    { key: 'food', label: '사료', max: FOOD_MAX, unit: '개' },
    { key: 'toy', label: '장난감', max: TOY_MAX, unit: '개' },
    { key: 'energy', label: '에너지', max: ENERGY_MAX, unit: '개' },
  ]

const HISTORY: HistoryEntry[] = [
  {
    id: 'i1',
    tab: 'item',
    category: 'use',
    title: '사료 주기',
    note: '맛있게 먹고 배를 동그랗게 만들었어요.',
    time: '2026-07-08 14:20:28',
    delta: -1,
    kind: 'food',
  },
  {
    id: 'i2',
    tab: 'item',
    category: 'claim',
    title: '장난감 받기',
    note: '같이 놀 준비가 됐어요. 언제든 꺼내 주세요.',
    time: '2026-07-08 14:18:14',
    delta: 1,
    kind: 'toy',
  },
  {
    id: 'i3',
    tab: 'item',
    category: 'use',
    title: '장난감 주기',
    note: '잠깐 놀아도 기분이 확 좋아져요. 또 불러 주세요.',
    time: '2026-07-08 10:05:12',
    delta: -1,
    kind: 'toy',
  },
  {
    id: 'i4',
    tab: 'item',
    category: 'claim',
    title: '사료 받기',
    note: '다음에 배고플 때 바로 줄 수 있게 준비해 뒀어요.',
    time: '2026-07-08 10:00:16',
    delta: 1,
    kind: 'food',
  },
  {
    id: 'e1',
    tab: 'energy',
    category: 'chat',
    title: '대화하기',
    note: '오늘 나눈 이야기 덕분에 마음이 조금 가벼워졌어요. 언제든 다시 들려주세요.',
    time: '2026-07-08 14:20:28',
    delta: -1,
    kind: 'energy',
  },
  {
    id: 'e2',
    tab: 'energy',
    category: 'meal',
    title: '사료 주기',
    note: '잘 먹고 기운을 차렸어요. 챙겨 줘서 고마워요!',
    time: '2026-07-08 14:18:14',
    delta: 2,
    kind: 'energy',
  },
  {
    id: 'e3',
    tab: 'energy',
    category: 'play',
    title: '놀아주기',
    note: '신나게 놀고 나니 꼬리가 멈추질 않아요. 또 놀아 줄래요?',
    time: '2026-07-08 10:05:12',
    delta: 4,
    kind: 'energy',
  },
  {
    id: 'e4',
    tab: 'energy',
    category: 'diary',
    title: '마음일기',
    note: '적어 준 마음을 조용히 곁에서 들어줬어요. 남겨 줘서 든든해요.',
    time: '2026-07-08 10:00:16',
    delta: 2,
    kind: 'energy',
  },
  {
    id: 'e5',
    tab: 'energy',
    category: 'attend',
    title: '출석하기',
    note: '출석해 줘서 하루가 더 특별해요. 내일도 기다려요.',
    time: '2026-07-08 08:00:16',
    delta: 1,
    kind: 'energy',
  },
]

const TABS: { key: HistoryTab; label: string }[] = [
  { key: 'item', label: '아이템 기록' },
  { key: 'energy', label: '에너지 기록' },
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
  return null
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
  const [tab, setTab] = useState<HistoryTab>('item')
  const [openId, setOpenId] = useState<string | null>(null)

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

  const entries = useMemo(
    () => HISTORY.filter((e) => e.tab === tab),
    [tab],
  )

  const switchTab = (next: HistoryTab) => {
    if (next === tab) return
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpenId(null)
    setTab(next)
  }

  const toggleNote = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpenId((prev) => (prev === id ? null : id))
  }

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>지금 내 보관함에 있어요</Text>
          <View style={styles.summaryRow}>
            {STOCK_COLS.map((col) => {
              const have = toCount(stock[col.key])
              return (
                <View key={`have-${col.key}`} style={styles.summaryCol}>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{col.label}</Text>
                  </View>
                  <Text style={styles.summaryValue}>
                    <Text style={styles.summaryHave}>{have}</Text>
                    {` / ${col.max}${col.unit}`}
                  </Text>
                </View>
              )
            })}
          </View>

          <View style={styles.summaryDivider} />

          <Text style={styles.summaryTitle}>
            오늘 내 마음을 돌보고 얻었어요
          </Text>
          <View style={styles.summaryRow}>
            {STOCK_COLS.map((col) => {
              const gained = TODAY_GAIN[col.key]
              const cap = TODAY_GAIN_MAX[col.key]
              return (
                <View key={`gain-${col.key}`} style={styles.summaryCol}>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{col.label}</Text>
                  </View>
                  <Text style={styles.summaryValue}>
                    <Text style={styles.summaryHave}>{gained}</Text>
                    {` / ${cap}${col.unit}`}
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

        <View style={styles.list}>
          {entries.map((item, index) => {
            const deltaLabel = formatDelta(item.delta, '개')
            const open = openId === item.id
            const positive = item.delta > 0
            return (
              <View
                key={item.id}
                style={index > 0 ? styles.rowDivider : undefined}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={item.title}
                  onPress={() => toggleNote(item.id)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.rowIcon}>
                    <CategoryIcon category={item.category} kind={item.kind} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowTime}>{item.time}</Text>
                  </View>
                  {deltaLabel ? (
                    <Text
                      style={[
                        styles.rowDelta,
                        positive ? styles.rowDeltaPlus : styles.rowDeltaMinus,
                      ]}
                    >
                      {deltaLabel}
                    </Text>
                  ) : null}
                  <View
                    style={{
                      transform: [{ rotate: open ? '180deg' : '0deg' }],
                    }}
                  >
                    <CaretDown
                      size={14}
                      color={Colors.textDisabled}
                      weight="bold"
                    />
                  </View>
                </Pressable>
                {open ? (
                  <View style={styles.noteWrap}>
                    <Text style={styles.noteText}>{item.note}</Text>
                  </View>
                ) : null}
              </View>
            )
          })}
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
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.creamyBeige,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  summaryHave: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.selected,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDisabled,
    marginBottom: 12,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabUnderline: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  tabUnderlineOn: {
    backgroundColor: Colors.primary,
  },
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    minHeight: 64,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowTime: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  rowDelta: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  rowDeltaPlus: {
    color: Colors.primary,
  },
  rowDeltaMinus: {
    color: Colors.textPrimary,
  },
  noteWrap: {
    marginLeft: 52,
    marginRight: 4,
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.creamyBeige,
  },
  noteText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
})
