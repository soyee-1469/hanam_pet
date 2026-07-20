import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import {
  CaretLeft,
  DotsThreeVertical,
  PencilSimple,
  TrashSimple,
} from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout, HeaderTitleStyle } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import {
  DIARY_MOOD_LABEL_COLOR,
  type DiaryEntry,
} from '../constants/diaryDemo'
import { MoodEmoji } from '../components/MoodEmoji'
import { EmptyRecordsCard } from '../components/EmptyRecordsCard'
import { BottomSheet, ConfirmDialog, PrimaryButton } from '../components/ui'
import {
  hydrateDiaryRecords,
  listDiaryEntries,
  subscribeDiaryRecords,
} from '../lib/diaryRecords'
import {
  formatDateFromYmd,
  formatDateTime,
  formatMonthDayTimeWithWeekday,
  formatTime,
  formatYearMonth,
} from '../lib/dateFormat'
import { showToast } from '../lib/toast'

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

function parseNum(raw: string | string[] | undefined, fallback: number) {
  const v = Array.isArray(raw) ? raw[0] : raw
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export default function DiaryListScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{
    year?: string
    month?: string
    day?: string
  }>()
  const now = useMemo(() => new Date(), [])
  const year = parseNum(params.year, now.getFullYear())
  const month = parseNum(params.month, now.getMonth() + 1)
  const dayParam = Array.isArray(params.day) ? params.day[0] : params.day
  const day =
    dayParam != null && dayParam !== ''
      ? parseNum(dayParam, 0)
      : null
  const isDayMode = day != null && day > 0

  const [entries, setEntries] = useState<DiaryEntry[]>(() => listDiaryEntries())
  const [menuEntry, setMenuEntry] = useState<DiaryEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    void hydrateDiaryRecords().then(() => setEntries(listDiaryEntries()))
    return subscribeDiaryRecords(() => setEntries(listDiaryEntries()))
  }, [])

  const list = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    )
    if (isDayMode && day != null) {
      return sorted.filter(
        (e) => e.year === year && e.month === month && e.day === day,
      )
    }
    return sorted.filter((e) => e.year === year && e.month === month)
  }, [entries, year, month, day, isDayMode])

  const summaryLabel = isDayMode
    ? formatDateFromYmd(year, month, day!)
    : formatYearMonth(year, month)

  const closeMenu = () => setMenuEntry(null)

  const openWrite = () => {
    router.push({
      pathname: '/diary-write',
      params: {
        year: String(year),
        month: String(month),
        day: String(isDayMode && day != null ? day : now.getDate()),
      },
    })
  }

  const onRewrite = () => {
    if (!menuEntry) return
    const id = menuEntry.id
    closeMenu()
    router.push({
      pathname: '/diary-write',
      params: { id },
    })
  }

  const onDelete = () => {
    if (!menuEntry) return
    const id = menuEntry.id
    closeMenu()
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    setEntries((prev) => prev.filter((e) => e.id !== deleteId))
    setDeleteId(null)
    showToast('일기 내용을 지웠어요')
  }

  const menuMood = menuEntry ? moodMeta(menuEntry.moodId) : null

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isDayMode ? '이날의 마음' : '마음일기장'}
        </Text>
        <View style={styles.sideBtn} />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryMonth}>{summaryLabel}</Text>
        <Text style={styles.summaryCount}>총 {list.length}개 기록</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isDayMode ? 100 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <EmptyRecordsCard
            icon={require('../assets/images/아이콘/메모장.png')}
            title={
              isDayMode
                ? '이 날의 기록이 없어요'
                : '아직 마음을 남겨 보기 전이에요!'
            }
            body={
              isDayMode
                ? '지금 바로 마음을 남겨 볼까요?'
                : '달력에서 첫 기록을 남기면,\n여기에서 모아 볼 수 있어요.'
            }
            ctaLabel={isDayMode ? '마음을 기록할게요' : '달력으로 가기'}
            onPressCta={
              isDayMode ? openWrite : () => router.replace('/(tabs)/diary')
            }
          />
        ) : (
          list.map((entry) => {
            const mood = moodMeta(entry.moodId)
            const timeLabel = isDayMode
              ? formatTime(entry.createdAt)
              : formatMonthDayTimeWithWeekday(entry.createdAt)
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityLabel={`${timeLabel} ${mood.label}`}
                onPress={() =>
                  router.push({
                    pathname: '/diary-detail',
                    params: { id: entry.id },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.emojiWrap}>
                  <MoodEmoji index={mood.emojiIndex} size={36} />
                  <Text
                    style={[
                      styles.cardMood,
                      { color: DIARY_MOOD_LABEL_COLOR[entry.moodId] },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardDate}>{timeLabel}</Text>
                  </View>
                  <Text style={styles.cardPreview} numberOfLines={2}>
                    {entry.preview}
                  </Text>
                  <View style={styles.tagRow}>
                    {entry.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="더보기"
                  hitSlop={8}
                  onPress={(e) => {
                    e?.stopPropagation?.()
                    setMenuEntry(entry)
                  }}
                  style={styles.moreBtn}
                >
                  <DotsThreeVertical
                    size={18}
                    color={Colors.textDisabled}
                    weight="bold"
                  />
                </Pressable>
              </Pressable>
            )
          })
        )}
      </ScrollView>

      {isDayMode ? (
        <View
          style={[
            styles.writeBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <PrimaryButton
            label="마음을 기록할게요"
            emphasized
            onPress={openWrite}
          />
        </View>
      ) : null}

      <BottomSheet
        visible={menuEntry != null}
        onRequestClose={closeMenu}
        sheetStyle={styles.sheet}
      >
        <Text style={styles.sheetTitle}>이 날의 마음을 어떻게 할까요?</Text>

        {menuEntry && menuMood ? (
          <View style={styles.sheetSummary}>
            <View style={styles.sheetMoodLeft}>
              <MoodEmoji index={menuMood.emojiIndex} size={28} />
              <Text
                style={[
                  styles.sheetMoodLabel,
                  { color: DIARY_MOOD_LABEL_COLOR[menuEntry.moodId] },
                ]}
              >
                {menuMood.label}
              </Text>
            </View>
            <Text style={styles.sheetSummaryDate}>
              {formatDateTime(menuEntry.createdAt)}
            </Text>
          </View>
        ) : null}

        <View style={styles.sheetDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다시 쓸게요"
          onPress={onRewrite}
          style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
        >
          <View style={styles.actionIcon}>
            <PencilSimple
              size={22}
              color={Colors.textPrimary}
              weight="regular"
            />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>다시 쓸게요</Text>
            <Text style={styles.actionDesc}>일기 내용을 고쳐요</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지울래요"
          onPress={onDelete}
          style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
        >
          <View style={styles.actionIcon}>
            <TrashSimple
              size={22}
              color={Colors.textPrimary}
              weight="regular"
            />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>지울래요</Text>
            <Text style={styles.actionDesc}>일기 내용이 사라져요</Text>
          </View>
        </Pressable>
      </BottomSheet>

      <ConfirmDialog
        visible={deleteId != null}
        title="일기를 지울까요?"
        body={
          '적어주신 마음의 기록이 사라져요.\n지운 이야기는 다시 볼 수 없어요.'
        }
        cancelLabel="나중에 할게요"
        confirmLabel="지울래요"
        tone="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    opacity: 0.88,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    ...HeaderTitleStyle.screen,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingH,
    marginBottom: 12,
  },
  summaryMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  emojiWrap: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardMood: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardPreview: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#FCE8DC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  moreBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  writeBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  sheet: {
    backgroundColor: Colors.background,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginBottom: 4,
  },
  sheetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  sheetMoodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  sheetMoodLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  sheetSummaryDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
})
