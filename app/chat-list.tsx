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
import { CaretLeft, CaretRight, ChatCircle } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout, HeaderTitleStyle } from '../constants/Layout'
import { EmptyRecordsCard } from '../components/EmptyRecordsCard'
import {
  listChatThreads,
  type ChatHistoryThreadSummary,
} from '../lib/chatHistory'
import { formatDateFromYmdWithWeekday } from '../lib/dateFormat'
import { getPetName } from '../lib/petProfile'
import { getOnboardingProfile } from '../lib/onboardingStorage'
import { useEffect } from 'react'

function parseYmd(date: string) {
  const [y, m, d] = date.split('-').map((n) => Number(n))
  return { y, m, d }
}

function ThreadRow({
  thread,
  petName,
}: {
  thread: ChatHistoryThreadSummary
  petName: string
}) {
  const { y, m, d } = parseYmd(thread.date)
  const dateLabel = formatDateFromYmdWithWeekday(y, m, d)
  const hasUnread = thread.unreadCount > 0

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel} 대화`}
      onPress={() =>
        router.push({
          pathname: '/chat-detail',
          params: { id: thread.id },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <ChatCircle
          size={22}
          color={hasUnread ? Colors.primary : Colors.textSecondary}
          weight={hasUnread ? 'fill' : 'regular'}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.date} numberOfLines={1}>
            {dateLabel}
          </Text>
          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{thread.unreadCount}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.preview} numberOfLines={2}>
          {thread.preview.replaceAll('하치', petName)}
        </Text>
      </View>
      <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
    </Pressable>
  )
}

export default function ChatListScreen() {
  const threads = useMemo(() => listChatThreads(), [])
  const [petName, setPetName] = useState('하치')

  useEffect(() => {
    void (async () => {
      const profile = await getOnboardingProfile()
      const name = await getPetName(profile?.petId ?? 'mongi')
      if (name) setPetName(name)
    })()
  }, [])

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
        <Text style={styles.headerTitle}>대화 기록</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {threads.length === 0 ? (
          <EmptyRecordsCard title="아직 나눈 대화가 없어요" />
        ) : (
          threads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} petName={petName} />
          ))
        )}
      </ScrollView>
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
  list: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.surface,
  },
  preview: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 19,
  },
})
