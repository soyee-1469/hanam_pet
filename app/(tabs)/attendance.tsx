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
import { CaretLeft, CheckCircle, Lightning, PawPrint } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { PrimaryButton } from '../../components/ui'
import {
  ATTENDANCE_ENERGY_REWARD,
  dateKey,
  loadAttendanceKeys,
  saveAttendanceKeys,
  stampToday,
} from '../../lib/attendance'
import { ENERGY_ATTEND_GAIN, ENERGY_MAX, addEnergy } from '../../lib/petStock'
import { showToast } from '../../lib/toast'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 데모용 — 시안 출석일 패턴 (오늘 이전만) */
function demoKeysForMonth(year: number, month: number, today: Date): string[] {
  const seed = [1, 2, 3, 6, 7, 8, 10, 13, 14, 15, 16, 20, 21]
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
  const todayDay = today.getDate()
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
      const result = await addEnergy(ENERGY_ATTEND_GAIN)
      if (result.credited <= 0) {
        showToast(
          result.stock.energy >= ENERGY_MAX
            ? '출석 완료! 에너지는 이미 가득해요'
            : '출석 완료! 오늘 에너지 한도에 도달했어요',
        )
      } else if (result.credited < ENERGY_ATTEND_GAIN) {
        showToast(`출석 완료! +${result.credited}만 적립됐어요`)
      } else {
        showToast(`출석 완료! +${result.credited} 에너지`)
      }
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
              {'하루에 한 번씩\n도장을 찍어 주세요'}
            </Text>
            <Text style={styles.heroSub}>
              출석하면 에너지를 모을 수 있어요
            </Text>
            <View style={styles.energyPill}>
              <Lightning size={14} color={Colors.accent} weight="fill" />
              <Text style={styles.energyPillText}>
                이번 달{' '}
                <Text style={styles.energyPillEm}>{monthEnergy}</Text>
                {' 에너지'}
              </Text>
            </View>
          </View>
          <View style={styles.heroImageWrap}>
            <Image
              source={stampedToday ? DogExpr.wink : DogExpr.soft}
              style={styles.heroImage}
              resizeMode="contain"
              accessibilityLabel="펫"
            />
          </View>
        </View>

        <View style={styles.calCard}>
          <View style={styles.calHeader}>
            <Text style={styles.calMonth}>
              {year}년 {month + 1}월
            </Text>
            <View style={styles.calCountPill}>
              <Text style={styles.calCountText}>
                출석 {monthStampCount}/{daysInMonth}일
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={w}
                style={[
                  styles.weekLabel,
                  i === 0 && styles.weekLabelSun,
                  i === 6 && styles.weekLabelSat,
                ]}
              >
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
              const isFuture = day > todayDay
              return (
                <View key={key} style={styles.cell}>
                  {isStamped ? (
                    <View
                      style={[
                        styles.dayDisk,
                        styles.stampDisk,
                        isToday && styles.stampDiskToday,
                      ]}
                      accessibilityLabel={`${day}일 출석 완료`}
                    >
                      <PawPrint
                        size={18}
                        color={Colors.selected}
                        weight="fill"
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.dayDisk,
                        styles.emptyDisk,
                        isToday && styles.emptyDiskToday,
                        isFuture && styles.emptyDiskFuture,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.dayTextToday,
                          isFuture && styles.dayTextFuture,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotStamp]}>
                <PawPrint size={10} color={Colors.selected} weight="fill" />
              </View>
              <Text style={styles.legendText}>출석한 날</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotEmpty]} />
              <Text style={styles.legendText}>도장 없는 날</Text>
            </View>
          </View>

          <View style={styles.stampCta}>
            {stampedToday ? (
              <View
                style={styles.doneBtn}
                accessibilityRole="text"
                accessibilityLabel="오늘 출석 완료"
              >
                <CheckCircle
                  size={20}
                  color={Colors.textSecondary}
                  weight="fill"
                />
                <Text style={styles.doneBtnText}>오늘 출석 완료!</Text>
              </View>
            ) : (
              <>
                <View style={styles.ctaHint}>
                  <Lightning size={14} color={Colors.accent} weight="fill" />
                  <Text style={styles.ctaHintText}>
                    출석 보상{' '}
                    <Text style={styles.ctaHintEm}>
                      +{ATTENDANCE_ENERGY_REWARD}
                    </Text>
                    {' 에너지'}
                  </Text>
                </View>
                <PrimaryButton
                  label={`출석하고 ${ATTENDANCE_ENERGY_REWARD}개 에너지 받기`}
                  emphasized
                  disabled={busy}
                  onPress={() => {
                    void onStamp()
                  }}
                />
              </>
            )}
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
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: 16,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.creamyBeige,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  energyPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  energyPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  energyPillEm: {
    fontWeight: '700',
    color: Colors.accent,
  },
  heroImageWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: 84,
    height: 84,
  },
  calCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    ...Shadows.elevation,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  calMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  calCountPill: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  calCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  weekLabelSun: {
    color: Colors.textSecondary,
  },
  weekLabelSat: {
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 5,
    minHeight: 48,
  },
  dayDisk: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampDisk: {
    backgroundColor: Colors.creamyBeige,
  },
  stampDiskToday: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  emptyDisk: {
    backgroundColor: Colors.surfaceSecondary,
  },
  emptyDiskToday: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.selected,
  },
  emptyDiskFuture: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayTextToday: {
    fontWeight: '700',
    color: Colors.selected,
  },
  dayTextFuture: {
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDotStamp: {
    backgroundColor: Colors.creamyBeige,
  },
  legendDotEmpty: {
    backgroundColor: Colors.surfaceSecondary,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  stampCta: {
    marginTop: 16,
    gap: 10,
  },
  ctaHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ctaHintText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  ctaHintEm: {
    fontWeight: '700',
    color: Colors.accent,
  },
  doneBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.creamyBeige,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
