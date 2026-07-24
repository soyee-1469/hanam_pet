/** 대화 기록 상세용 데모 (서버 연동 전) */

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

const PET_REPLY =
  '누군가에게 말하기 힘들만한 상황이었겠어요. 몸도 마음도 많이 지친게 느껴져요. 잠들기 전에 5분 만이라도 하치랑 같이 천천히 숨을 골라볼까요?'

export const DEMO_CHAT_THREAD: ChatHistoryThread = {
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
      at: '2026-07-23 01:11:12',
      unread: false,
    },
    {
      id: 'm4',
      role: 'pet',
      text: PET_REPLY,
      at: '2026-07-23 01:11:14',
      unread: true,
    },
  ],
}

export function getChatThread(id?: string): ChatHistoryThread | null {
  if (!id || id === DEMO_CHAT_THREAD.id) return DEMO_CHAT_THREAD
  return null
}

export function countUnreadChatMessages(thread: ChatHistoryThread) {
  return thread.messages.filter((m) => m.unread).length
}

export function markAllChatMessagesRead(thread: ChatHistoryThread) {
  for (const m of thread.messages) m.unread = false
}
