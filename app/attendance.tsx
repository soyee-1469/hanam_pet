import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, PawPrint } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout, tabBarReserveHeight } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import { PrimaryButton } from '../components/ui'
import {
  ATTENDANCE_ENERGY_REWARD,
  dateKey,
  loadAttendanceKeys,
  saveAttendanceKeys,
  stampToday,
} from '../lib/attendance'
import { refillChatEnergy } from '../lib/chatEnergy'
import { showToast } from '../lib/toast'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 데모용 — 스토리지 비어 있을 때 이번 달 일부 출석 */
function demoKeysForMonth(year: number, month: number, today: Date): string[] {
  const seed = [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 19]
  const todayDay = today.getDate()
  return seed
    .filter((d) => d < todayDay)
    .map((d) => dateKey(new Date(year, month, d)))
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

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = dateKey(today)
  const cells = useMemo(() => getMonthMatrix(year, month), [year, month])

  const [stamped, setStamped] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void (async () => {
        let keys = await loadAttendanceKeys()
        if (keys.length === 0) {
          keys = demoKeysForMonth(year, month, today)
          await saveAttendanceKeys(keys)
        }
        if (!alive) return
        setStamped(new Set(keys))
      })()
      return () => {
        alive = false
      }
    }, [year, month, today]),
  )

  const monthStampCount = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
    let n = 0
    stamped.forEach((k) => {
      if (k.startsWith(prefix)) n += 1
    })
    return n
  }, [stamped, year, month])

  const monthEnergy = monthStampCount * ATTENDANCE_ENERGY_REWARD
  const stampedToday = stamped.has(todayKey)

  const onStamp = async () => {
    if (busy || stampedToday) return
    setBusy(true)
    try {
      const next = await stampToday(today)
      if (!next) {
        showToast('오늘은 이미 도장을 찍었어요')
        return
      }
      setStamped(new Set(next))
      await refillChatEnergy()
      showToast(`출석 완료! +${ATTENDANCE_ENERGY_REWARD} 에너지`)
    } finally {
      setBusy(false)
    }
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
        <Text style={styles.title}>출석 도장</Text>
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
        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {'하루에 한 번씩\n도장을 찍어주세요'}
            </Text>
            <Text style={styles.heroSub}>
              출석하면 {ATTENDANCE_ENERGY_REWARD} 에너지를 얻을 수 있어요!
            </Text>
            <View style={styles.energyPill}>
              <Text style={styles.energyPillText}>
                이번 달 모은 에너지 {monthEnergy} 에너지
              </Text>
            </View>
          </View>
          <Image
            source={DogExpr.fun}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="펫"
          />
        </View>

        <View style={styles.calCard}>
          <View style={styles.calHeader}>
            <Text style={styles.calMonth}>
              {year}년 {month + 1}월
            </Text>
            <View style={styles.calCountPill}>
              <Text style={styles.calCountText}>
                이번 달 출석 {monthStampCount}/{daysInMonth}일
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekLabel}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day == null) {
                return <View key={`e-${i}`} style={styles.cell} />
              }
              const key = dateKey(new Date(year, month, day))
              const isStamped = stamped.has(key)
              const isToday = key === todayKey
              return (
                <View key={key} style={styles.cell}>
                  {isStamped ? (
                    <View style={styles.stampWrap}>
                      <PawPrint size={22} color={Colors.primary} weight="fill" />
                    </View>
                  ) : (
                    <View
                      style={[styles.dayWrap, isToday && styles.dayWrapToday]}
                    >
                      <Text
                        style={[styles.dayText, isToday && styles.dayTextToday]}
                      >
                        {day}
                      </Text>
                    </View>
                  )}
                  {isToday && !isStamped ? (
                    <View style={styles.todayDot} />
                  ) : (
                    <View style={styles.todayDotSpacer} />
                  )}
                </View>
              )
            })}
          </View>

          <View style={styles.stampCta}>
            <PrimaryButton
              label={
                stampedToday
                  ? '오늘은 출석 완료!'
                  : `오늘의 도장 찍기 (+${ATTENDANCE_ENERGY_REWARD}에너지)`
              }
              disabled={stampedToday || busy}
              onPress={() => {
                void onStamp()
              }}
            />
          </View>
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
    gap: 16,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    ...Shadows.elevation,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  energyPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.iconFeed,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  energyPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroImage: {
    width: 88,
    height: 88,
  },
  calCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    ...Shadows.elevation,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calMonth: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  calCountPill: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  calCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 44,
  },
  stampWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayWrapToday: {
    backgroundColor: Colors.iconFeed,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayTextToday: {
    fontWeight: '800',
    color: Colors.primary,
  },
  todayDot: {
    marginTop: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  todayDotSpacer: {
    marginTop: 3,
    height: 4,
  },
  stampCta: {
    marginTop: 12,
  },
})
