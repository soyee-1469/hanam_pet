import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretLeft,
  CalendarBlank,
  DotsThreeVertical,
  PencilSimple,
  TrashSimple,
} from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import {
  DIARY_DEMO_ENTRIES,
  DIARY_MOOD_LABEL_COLOR,
  type DiaryEntry,
} from '../constants/diaryDemo'
import { MoodEmoji } from '../components/MoodEmoji'
import { BottomSheet, ConfirmDialog } from '../components/ui'
import { showToast } from '../lib/toast'

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

export default function DiaryListScreen() {
  const [year] = useState(2026)
  const [month] = useState(7)
  const [entries, setEntries] = useState(DIARY_DEMO_ENTRIES)
  const [menuEntry, setMenuEntry] = useState<DiaryEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const list = useMemo(
    () =>
      entries
        .filter((e) => e.year === year && e.month === month)
        .sort((a, b) => b.day - a.day),
    [entries, year, month],
  )

  const closeMenu = () => setMenuEntry(null)

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
        <Text style={styles.headerTitle}>마음일기장</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="달력으로"
          onPress={() => router.replace('/(tabs)/diary')}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CalendarBlank size={22} color={Colors.textPrimary} weight="regular" />
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryMonth}>
          {year}년 {month}월
        </Text>
        <Text style={styles.summaryCount}>총 {list.length}개 기록</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
            <Text style={styles.emptyBody}>
              달력에서 날짜를 눌러 마음을 남겨 보세요.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(tabs)/diary')}
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emptyCtaText}>달력으로 가기</Text>
            </Pressable>
          </View>
        ) : (
          list.map((entry) => {
            const mood = moodMeta(entry.moodId)
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityLabel={`${entry.month}월 ${entry.day}일 ${mood.label}`}
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
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardDate}>
                      {entry.month}월 {entry.day}일 {entry.weekday}
                    </Text>
                    <Text
                      style={[
                        styles.cardMood,
                        { color: DIARY_MOOD_LABEL_COLOR[entry.moodId] },
                      ]}
                    >
                      {mood.label}
                    </Text>
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

      <BottomSheet
        visible={menuEntry != null}
        onRequestClose={closeMenu}
        sheetStyle={styles.sheet}
      >
        <Text style={styles.sheetTitle}>이 날의 마음을 어떻게 할까요?</Text>

        {menuEntry && menuMood ? (
          <View style={styles.sheetSummary}>
            <View style={styles.sheetEmojiWrap}>
              <MoodEmoji index={menuMood.emojiIndex} size={28} />
            </View>
            <Text style={styles.sheetSummaryDate}>
              {menuEntry.month}월 {menuEntry.day}일 {menuEntry.weekday}
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
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
    paddingBottom: 32,
    gap: 10,
  },
  empty: {
    paddingTop: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FCE8DC',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    fontWeight: '800',
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
  sheet: {
    backgroundColor: Colors.background,
  },
  sheetTitle: {
    fontSize: 17,
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
    gap: 10,
    marginBottom: 16,
  },
  sheetEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSummaryDate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
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
