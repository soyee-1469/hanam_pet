import { useMemo, useState } from 'react'
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
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import {
  DIARY_DEMO_ENTRIES,
  DIARY_MOOD_LABEL_COLOR,
  type DiaryEntry,
} from '../constants/diaryDemo'
import { MoodEmoji } from '../components/MoodEmoji'
import {
  BottomSheet,
  ConfirmDialog,
  PrimaryButton,
  onboardingFooterStyle,
} from '../components/ui'
import { showToast } from '../lib/toast'

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

export default function DiaryDetailScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const entry = useMemo(
    () => (id ? DIARY_DEMO_ENTRIES.find((e) => e.id === id) : undefined),
    [id],
  )

  if (!entry) {
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
          <Text style={styles.headerTitle}>마음일기</Text>
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

  const closeMenu = () => setMenuOpen(false)

  const onRewrite = () => {
    closeMenu()
    router.push({
      pathname: '/diary-write',
      params: { id: entry.id },
    })
  }

  const onDelete = () => {
    closeMenu()
    setDeleteOpen(true)
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
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>마음일기</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <DotsThreeVertical
            size={22}
            color={Colors.textPrimary}
            weight="bold"
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>
          {entry.year}년 {entry.month}월 {entry.day}일 {entry.weekday}
        </Text>

        <View style={styles.moodBlock}>
          <MoodEmoji index={mood.emojiIndex} size={56} />
          <Text
            style={[styles.moodLabel, { color: DIARY_MOOD_LABEL_COLOR[entry.moodId] }]}
          >
            {mood.label}
          </Text>
        </View>

        <View style={styles.tagRow}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{entry.body}</Text>
        </View>
      </ScrollView>

      <View
        style={[
          onboardingFooterStyle,
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <PrimaryButton label="다시 쓸게요" emphasized onPress={onRewrite} />
      </View>

      <BottomSheet visible={menuOpen} onRequestClose={closeMenu}>
        <Text style={styles.sheetTitle}>이 날의 마음을 어떻게 할까요?</Text>
        <View style={styles.sheetDivider} />
        <View style={styles.sheetSummary}>
          <MoodEmoji index={mood.emojiIndex} size={28} />
          <Text style={styles.sheetSummaryDate}>
            {entry.month}월 {entry.day}일 {entry.weekday}
          </Text>
        </View>
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
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  missingBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 24,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  moodBlock: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bodyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 20,
    ...Shadows.elevation,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  footer: {
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
  },
  sheetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
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
