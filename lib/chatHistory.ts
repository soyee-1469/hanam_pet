/** 대화 기록 목록·상세용 데모 (서버 연동 전) */

export type ChatHistoryRole = 'user' | 'pet'

export type ChatHistoryMessage = {
  id: string
  role: ChatHistoryRole
  text: string
  /** HH:mm:ss 표시용 ISO / 저장 시각 */
  at: string
  unread: boolean
}

export type ChatHistoryThread = {
  id: string
  /** YYYY-MM-DD */
  date: string
  messages: ChatHistoryMessage[]
}

export type ChatHistoryThreadSummary = {
  id: string
  date: string
  preview: string
  unreadCount: number
  messageCount: number
}

const PET_REPLY =
  '누군가에게 말하기 힘들만한 상황이었겠어요. 몸도 마음도 많이 지친게 느껴져요. 잠들기 전에 5분 만이라도 하치랑 같이 천천히 숨을 골라볼까요?'

export const DEMO_CHAT_THREADS: ChatHistoryThread[] = [
  {
    id: 'c1',
    date: '2026-07-23',
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: '힘든일이 있었어..',
        at: '2026-07-23 01:11:12',
        unread: false,
      },
      {
        id: 'm2',
        role: 'pet',
        text: PET_REPLY,
        at: '2026-07-23 01:11:14',
        unread: true,
      },
      {
        id: 'm3',
        role: 'user',
        text: '후하~후하~',
        at: '2026-07-23 01:11:16',
        unread: false,
      },
      {
        id: 'm4',
        role: 'pet',
        text: PET_REPLY,
        at: '2026-07-23 01:11:18',
        unread: true,
      },
    ],
  },
  {
    id: 'c2',
    date: '2026-07-21',
    messages: [
      {
        id: 'm5',
        role: 'user',
        text: '오늘 조금 숨통이 트인 느낌이야.',
        at: '2026-07-21 21:04:02',
        unread: false,
      },
      {
        id: 'm6',
        role: 'pet',
        text: '그 마음, 여기 있어도 괜찮아. 천천히 말해도 돼.',
        at: '2026-07-21 21:04:08',
        unread: false,
      },
    ],
  },
  {
    id: 'c3',
    date: '2026-07-18',
    messages: [
      {
        id: 'm7',
        role: 'user',
        text: '잠이 잘 안 와서…',
        at: '2026-07-18 00:32:11',
        unread: false,
      },
      {
        id: 'm8',
        role: 'pet',
        text: '오늘 하루 버티느라 고생 많았어. 내가 곁에서 들어줄게.',
        at: '2026-07-18 00:32:20',
        unread: false,
      },
    ],
  },
]

/** @deprecated 단일 데모 — listChatThreads / getChatThread 사용 */
export const DEMO_CHAT_THREAD = DEMO_CHAT_THREADS[0]

function summarizeThread(thread: ChatHistoryThread): ChatHistoryThreadSummary {
  const last = thread.messages[thread.messages.length - 1]
  return {
    id: thread.id,
    date: thread.date,
    preview: last?.text ?? '',
    unreadCount: countUnreadChatMessages(thread),
    messageCount: thread.messages.length,
  }
}

export function listChatThreads(): ChatHistoryThreadSummary[] {
  return DEMO_CHAT_THREADS.map(summarizeThread).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  )
}

export function getChatThread(id?: string): ChatHistoryThread | null {
  if (!id) return DEMO_CHAT_THREADS[0] ?? null
  return DEMO_CHAT_THREADS.find((t) => t.id === id) ?? null
}

export function countUnreadChatMessages(thread: ChatHistoryThread) {
  return thread.messages.filter((m) => m.unread).length
}

export function markAllChatMessagesRead(thread: ChatHistoryThread) {
  for (const m of thread.messages) m.unread = false
}
