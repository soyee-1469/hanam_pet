import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretRight } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import { DIARY_MOOD_LABEL_COLOR } from '../constants/diaryDemo'
import { MoodEmoji } from './MoodEmoji'
import { formatDateTime } from '../lib/dateFormat'
import type { DiaryEntry } from '../constants/diaryDemo'

type DiaryDayEntryCardProps = {
  entry: DiaryEntry
  onPress: () => void
}

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

/**
 * 마음일기 탭·선택일 목록 카드
 * 좌: 감정(점·이모지·라벨) / 우: 일시·미리보기·쉐브론
 */
export function DiaryDayEntryCard({ entry, onPress }: DiaryDayEntryCardProps) {
  const mood = moodMeta(entry.moodId)
  const moodColor = DIARY_MOOD_LABEL_COLOR[entry.moodId]
  const timeLabel = formatDateTime(entry.createdAt)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mood.label} ${timeLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.moodCol}>
        <MoodEmoji
          index={mood.emojiIndex}
          size={36}
          colorDot={moodColor}
          dotSize={5}
        />
        <Text style={[styles.moodLabel, { color: moodColor }]}>
          {mood.label}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.time} numberOfLines={1}>
          {timeLabel}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {entry.preview}
        </Text>
      </View>

      <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
    </Pressable>
  )
}

/** 리스트 2칸 노출용 대략 높이 (카드+갭) */
export const DIARY_DAY_LIST_VISIBLE = 2
export const DIARY_DAY_CARD_SLOT = 88

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  moodCol: {
    width: 52,
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  time: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  preview: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
})
