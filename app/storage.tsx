import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, Lightning } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout, tabBarReserveHeight } from '../constants/Layout'

type TabId = 'item' | 'energy'

type StatTriple = {
  food: { have: number; max: number }
  toy: { have: number; max: number }
  energy: { have: number; max: number }
}

type HistoryEntry = {
  id: string
  title: string
  time: string
  delta: number
  unit?: string
  note?: string
  kind: 'food' | 'toy' | 'energy'
}

const STOCK: StatTriple = {
  food: { have: 3, max: 5 },
  toy: { have: 2, max: 5 },
  energy: { have: 48, max: 50 },
}

const TODAY_EARNED: StatTriple = {
  food: { have: 1, max: 2 },
  toy: { have: 1, max: 2 },
  energy: { have: 12, max: 20 },
}

const ENERGY_HISTORY: HistoryEntry[] = [
  {
    id: 'e1',
    title: '대화 하기',
    time: '2026-07-08 14:20:28',
    delta: -1,
    unit: '개',
    kind: 'energy',
  },
  {
    id: 'e2',
    title: '사료 주기',
    time: '2026-07-08 14:18:14',
    delta: 2,
    unit: '개',
    kind: 'energy',
    note: '※ 보유 에너지가 가득 차서 나머지 2개는 반영되지 않았어요. (최대 50)',
  },
  {
    id: 'e3',
    title: '놀아 주기',
    time: '2026-07-08 10:05:12',
    delta: 4,
    unit: '개',
    kind: 'energy',
  },
  {
    id: 'e4',
    title: '마음일기 작성',
    time: '2026-07-08 10:00:16',
    delta: 2,
    unit: '개',
    kind: 'energy',
  },
  {
    id: 'e5',
    title: '출석 도장',
    time: '2026-07-08 08:00:16',
    delta: 0,
    unit: '개',
    kind: 'energy',
    note: '※ 하루 보상 한도에 도달해 에너지는 더 이상 지급되지 않았어요.',
  },
]

const ITEM_HISTORY: HistoryEntry[] = [
  {
    id: 'i1',
    title: '사료 받기',
    time: '2026-07-08 09:12:04',
    delta: 1,
    unit: '개',
    kind: 'food',
  },
  {
    id: 'i2',
    title: '장난감 받기',
    time: '2026-07-08 09:12:04',
    delta: 1,
    unit: '개',
    kind: 'toy',
  },
  {
    id: 'i3',
    title: '사료 주기',
    time: '2026-07-07 21:05:12',
    delta: -1,
    unit: '개',
    kind: 'food',
  },
  {
    id: 'i4',
    title: '놀아 주기',
    time: '2026-07-07 20:40:08',
    delta: -1,
    unit: '개',
    kind: 'toy',
  },
]

function StatRow({
  label,
  have,
  max,
}: {
  label: string
  have: number
  max: number
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        <Text style={styles.statHave}>{have}</Text>
        <Text style={styles.statMax}> / {max}</Text>
      </Text>
    </View>
  )
}

function SummaryBlock({
  title,
  stats,
}: {
  title: string
  stats: StatTriple
}) {
  return (
    <View style={styles.summaryBlock}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <StatRow label="사료" have={stats.food.have} max={stats.food.max} />
      <StatRow label="장난감" have={stats.toy.have} max={stats.toy.max} />
      <StatRow
        label="에너지"
        have={stats.energy.have}
        max={stats.energy.max}
      />
    </View>
  )
}

export default function StorageScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const [tab, setTab] = useState<TabId>('energy')

  const list = useMemo(
    () => (tab === 'energy' ? ENERGY_HISTORY : ITEM_HISTORY),
    [tab],
  )

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
          <SummaryBlock title="지금 내 보관함에 있어요" stats={STOCK} />
          <View style={styles.summaryDivider} />
          <SummaryBlock
            title="오늘 내 마음을 돌보고 얻었어요"
            stats={TODAY_EARNED}
          />
        </View>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'item' }}
            onPress={() => setTab('item')}
            style={styles.tabBtn}
          >
            <Text
              style={[styles.tabLabel, tab === 'item' && styles.tabLabelOn]}
            >
              아이템 기록
            </Text>
            {tab === 'item' ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'energy' }}
            onPress={() => setTab('energy')}
            style={styles.tabBtn}
          >
            <Text
              style={[styles.tabLabel, tab === 'energy' && styles.tabLabelOn]}
            >
              에너지 기록
            </Text>
            {tab === 'energy' ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        </View>

        <View style={styles.list}>
          {list.map((item) => {
            const gained = item.delta > 0
            const zero = item.delta === 0
            const unit = item.unit ?? '개'
            const deltaLabel = zero
              ? `0${unit}`
              : gained
                ? `+${item.delta}${unit}`
                : `${item.delta}${unit}`

            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.iconWrap}>
                  {item.kind === 'energy' ? (
                    <Lightning
                      size={18}
                      color={Colors.accent}
                      weight="fill"
                    />
                  ) : (
                    <Image
                      source={
                        item.kind === 'food'
                          ? require('../assets/images/bowl.png')
                          : require('../assets/images/toy.png')
                      }
                      style={styles.itemIcon}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowTime}>{item.time}</Text>
                  {item.note ? (
                    <Text style={styles.rowNote}>{item.note}</Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.delta,
                    zero
                      ? styles.deltaZero
                      : gained
                        ? styles.deltaGain
                        : styles.deltaUse,
                  ]}
                >
                  {deltaLabel}
                </Text>
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
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...Shadows.elevation,
  },
  summaryBlock: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statHave: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  statMax: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 22,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
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
    bottom: 0,
    left: '18%',
    right: '18%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
    marginRight: 12,
    marginTop: 2,
  },
  itemIcon: {
    width: 22,
    height: 22,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowTime: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  rowNote: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  delta: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '800',
  },
  deltaGain: {
    color: Colors.primary,
  },
  deltaUse: {
    color: Colors.textSecondary,
  },
  deltaZero: {
    color: Colors.textDisabled,
  },
})
