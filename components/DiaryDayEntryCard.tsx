import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretRight } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DIARY_MOODS } from '../constants/Moods'
import { DIARY_MOOD_LABEL_COLOR } from '../constants/diaryDemo'
import { MoodEmoji } from './MoodEmoji'
import { formatTime } from '../lib/dateFormat'
import type { DiaryEntry } from '../constants/diaryDemo'

type DiaryDayEntryCardProps = {
  entry: DiaryEntry
  onPress: () => void
}

function moodMeta(id: DiaryEntry['moodId']) {
  return DIARY_MOODS.find((m) => m.id === id)!
}

/** HH:MM (초 생략) */
function formatTimeShort(input: Date | string | number) {
  const full = formatTime(input)
  if (!full) return ''
  const parts = full.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return full
}

/**
 * 마음일기 탭·일 목록 카드
 * 날짜 → 감정(머리 위 색점) → 태그 → 미리보기
 */
export function DiaryDayEntryCard({ entry, onPress }: DiaryDayEntryCardProps) {
  const mood = moodMeta(entry.moodId)
  const moodColor = DIARY_MOOD_LABEL_COLOR[entry.moodId]
  const timeLabel = formatTimeShort(entry.createdAt)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${timeLabel} ${mood.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.time}>{timeLabel}</Text>

        <View style={styles.moodRow}>
          <MoodEmoji
            index={mood.emojiIndex}
            size={28}
            colorDot={moodColor}
            dotSize={5}
          />
          <Text style={[styles.moodLabel, { color: moodColor }]}>
            {mood.label}
          </Text>
        </View>

        {entry.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.previewRow}>
          <Text style={styles.preview} numberOfLines={2}>
            {entry.preview}
          </Text>
          <CaretRight size={14} color={Colors.textDisabled} weight="bold" />
        </View>
      </View>
    </Pressable>
  )
}

/** 리스트 2칸 노출용 대략 높이 (카드+갭) */
export const DIARY_DAY_LIST_VISIBLE = 2
export const DIARY_DAY_CARD_SLOT = 128

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  body: {
    gap: 8,
    minWidth: 0,
  },
  time: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '800',
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preview: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
})
