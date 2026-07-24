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
import { CaretLeft } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout, HeaderTitleStyle } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import {
  DIARY_MOOD_LABEL_COLOR,
  type DiaryEntry,
} from '../constants/diaryDemo'
import { MoodEmoji } from '../components/MoodEmoji'
import { formatDateTime } from '../lib/dateFormat'
import { ConfirmDialog, PrimaryButton } from '../components/ui'
import { findDiaryEntry, hydrateDiaryRecords } from '../lib/diaryRecords'
import { showToast } from '../lib/toast'

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

export default function DiaryDetailScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    void hydrateDiaryRecords().then(() => setEpoch((n) => n + 1))
  }, [])

  const entry = useMemo(
    () => (id ? findDiaryEntry(id) : undefined),
    [id, epoch],
  )

  if (!entry) {
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
          <Text style={styles.headerTitle}>마음 기록</Text>
          <View style={styles.sideBtn} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>기록을 찾을 수 없어요</Text>
          <Text style={styles.missingBody}>
            삭제되었거나 잘못된 주소일 수 있어요.
          </Text>
          <PrimaryButton
            label="돌아가기"
            emphasized
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    )
  }

  const mood = moodMeta(entry.moodId)
  const moodColor = DIARY_MOOD_LABEL_COLOR[entry.moodId]

  const onRewrite = () => {
    router.push({
      pathname: '/diary-write',
      params: { id: entry.id },
    })
  }

  const confirmDelete = () => {
    setDeleteOpen(false)
    showToast('일기 내용을 지웠어요')
    router.back()
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
        <Text style={styles.headerTitle}>마음 기록</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.moodCol}>
              <MoodEmoji
                index={mood.emojiIndex}
                size={52}
                colorDot={moodColor}
                dotSize={7}
              />
              <Text style={[styles.moodLabel, { color: moodColor }]}>
                {mood.label}
              </Text>
            </View>
            <Text style={styles.date}>{formatDateTime(entry.createdAt)}</Text>
          </View>

          {entry.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {entry.tags.map((tag, i) => (
                <View key={`${tag}-${i}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.bodyText}>{entry.body}</Text>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지울래요"
          onPress={() => setDeleteOpen(true)}
          style={({ pressed }) => [
            styles.footerBtn,
            styles.deleteBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteBtnText}>지울래요</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다시 쓸게요"
          onPress={onRewrite}
          style={({ pressed }) => [
            styles.footerBtn,
            styles.rewriteBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.rewriteBtnText}>다시 쓸게요</Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={deleteOpen}
        title="일기를 지울까요?"
        body={
          '적어주신 마음의 기록이 사라져요.\n지운 이야기는 다시 볼 수 없어요.'
        }
        cancelLabel="나중에 할게요"
        confirmLabel="지울래요"
        tone="danger"
        onCancel={() => setDeleteOpen(false)}
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
  missing: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingH,
    justifyContent: 'center',
    gap: 10,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  missingBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.headerPaddingH,
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 20,
    paddingBottom: 22,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  moodCol: {
    alignItems: 'center',
    gap: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  date: {
    flexShrink: 1,
    paddingTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.1,
    textAlign: 'right',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bodyText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  footerBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: Colors.creamyBeige,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rewriteBtn: {
    backgroundColor: Colors.primary,
  },
  rewriteBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
})
