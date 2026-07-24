import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { ScreenHeader } from '../components/ui'
import {
  countUnreadChatMessages,
  getChatThread,
  markAllChatMessagesRead,
  type ChatHistoryMessage,
} from '../lib/chatHistory'
import { getOnboardingProfile } from '../lib/onboardingStorage'
import { getPetName } from '../lib/petProfile'
import {
  formatDateFromYmdWithWeekday,
  formatTime,
} from '../lib/dateFormat'
import { showToast } from '../lib/toast'

function parseYmd(date: string) {
  const [y, m, d] = date.split('-').map((n) => Number(n))
  return { y, m, d }
}

function MessageRow({
  message,
  name,
  text,
}: {
  message: ChatHistoryMessage
  name: string
  text: string
}) {
  const isUser = message.role === 'user'
  const timeLabel = formatTime(message.at)

  return (
    <View
      style={[styles.msgBlock, isUser ? styles.msgBlockUser : styles.msgBlockPet]}
    >
      <View
        style={[styles.metaRow, isUser ? styles.metaRowUser : styles.metaRowPet]}
      >
        <Text style={styles.metaName}>{name}</Text>
        <Text style={styles.metaTime}>{timeLabel}</Text>
      </View>
      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.petBubble]}
      >
        <Text style={isUser ? styles.userText : styles.petText}>{text}</Text>
      </View>
    </View>
  )
}

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const thread = useMemo(() => getChatThread(id), [id])
  const [unreadCount, setUnreadCount] = useState(() =>
    thread ? countUnreadChatMessages(thread) : 0,
  )
  const [nickname, setNickname] = useState('닉네임')
  const [petName, setPetName] = useState('하치')

  useEffect(() => {
    void (async () => {
      const profile = await getOnboardingProfile()
      if (profile?.nickname) setNickname(profile.nickname)
      const name = await getPetName(profile?.petId ?? 'mongi')
      if (name) setPetName(name)
    })()
  }, [])

  const dateLabel = useMemo(() => {
    if (!thread) return ''
    const { y, m, d } = parseYmd(thread.date)
    return formatDateFromYmdWithWeekday(y, m, d)
  }, [thread])

  const markAllRead = () => {
    if (!thread || unreadCount === 0) return
    markAllChatMessagesRead(thread)
    setUnreadCount(0)
    showToast('모두 읽음 처리했어요')
  }

  if (!thread) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="대화 상세" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>대화를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="대화 상세"
        onBack={() => router.back()}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="모두 읽음"
            accessibilityState={{ disabled: unreadCount === 0 }}
            hitSlop={8}
            disabled={unreadCount === 0}
            onPress={markAllRead}
            style={({ pressed }) => [
              styles.markAllBtn,
              pressed && unreadCount > 0 && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.markAllText,
                unreadCount === 0 && styles.markAllTextDisabled,
              ]}
            >
              모두 읽음
            </Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateStamp}>{dateLabel}</Text>

        {thread.messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            name={message.role === 'user' ? nickname : petName}
            text={
              message.role === 'pet'
                ? message.text.replaceAll('하치', petName)
                : message.text
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  markAllBtn: {
    minHeight: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 2,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  markAllTextDisabled: {
    color: Colors.textDisabled,
  },
  pressed: {
    opacity: 0.88,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  dateStamp: {
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  msgBlock: {
    maxWidth: '86%',
    gap: 6,
  },
  msgBlockUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  msgBlockPet: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  metaRowUser: {
    justifyContent: 'flex-end',
  },
  metaRowPet: {
    justifyContent: 'flex-start',
  },
  metaName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metaTime: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: Colors.accentSoft,
    borderBottomRightRadius: 6,
  },
  petBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
  },
  userText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  petText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
})
