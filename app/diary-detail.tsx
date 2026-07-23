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
import { formatDateTime } from '../lib/dateFormat'
import {
  BottomSheet,
  ConfirmDialog,
  GhostButton,
  PrimaryButton,
  onboardingFooterStyle,
} from '../components/ui'
import { findDiaryEntry, hydrateDiaryRecords } from '../lib/diaryRecords'
import { showToast } from '../lib/toast'

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

export default function DiaryDetailScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [menuOpen, setMenuOpen] = useState(false)
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
  const moodColor = DIARY_MOOD_LABEL_COLOR[entry.moodId]

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
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>마음일기</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          hitSlop={8}
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
          {formatDateTime(entry.createdAt)}
        </Text>

        {entry.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.moodBlock}>
          <MoodEmoji index={mood.emojiIndex} size={64} />
          <Text style={[styles.moodLabel, { color: moodColor }]}>
            {mood.label}
          </Text>
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
        <GhostButton
          label="목록으로 돌아가기"
          onPress={() =>
            router.replace({
              pathname: '/diary-list',
              params: {
                year: String(entry.year),
                month: String(entry.month),
                day: String(entry.day),
              },
            })
          }
        />
      </View>

      <BottomSheet visible={menuOpen} onRequestClose={closeMenu}>
        <Text style={styles.sheetTitle}>이 날의 마음을 어떻게 할까요?</Text>
        <View style={styles.sheetDivider} />
        <View style={styles.sheetSummary}>
          <View style={styles.sheetMoodLeft}>
            <MoodEmoji index={mood.emojiIndex} size={28} />
            <Text style={[styles.sheetMoodLabel, { color: moodColor }]}>
              {mood.label}
            </Text>
          </View>
          <Text style={styles.sheetSummaryDate}>
            {formatDateTime(entry.createdAt)}
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
          <View style={[styles.actionIcon, styles.actionIconDelete]}>
            <TrashSimple size={22} color={Colors.error} weight="regular" />
          </View>
          <View style={styles.actionCopy}>
            <Text style={[styles.actionTitle, styles.actionTitleDelete]}>
              지울래요
            </Text>
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
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.1,
    marginBottom: 24,
  },
  moodBlock: {
    alignItems: 'center',
    marginBottom: 22,
    gap: 14,
  },
  moodLabel: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 22,
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
  bodyCard: {
    backgroundColor: Colors.cardRecessed,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.screenPaddingH,
    paddingVertical: 22,
    minHeight: 160,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  footer: {
    paddingTop: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
  },
  sheetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
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
    letterSpacing: -0.1,
  },
  sheetSummaryDate: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
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
  actionIconDelete: {
    backgroundColor: '#F8EBE8',
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionTitleDelete: {
    color: Colors.error,
  },
  actionDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
})
