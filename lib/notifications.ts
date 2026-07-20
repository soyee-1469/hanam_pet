export type NotifCategory = 'notice' | 'service'

/** 알림 종류 — 탭 시 이동 목적지 결정에 사용 */
export type NotifType =
  | 'notice'
  | 'maintenance'
  | 'update'
  | 'terms'
  | 'energy'
  | 'claim'
  | 'diary'
  | 'chat'
  | 'attendance'
  | 'mind'

export type AppNotification = {
  id: string
  category: NotifCategory
  type: NotifType
  title: string
  body: string
  date: string
  unread: boolean
  icon: 'bell' | 'calendar'
  /** 있으면 type 기본값보다 우선. expo-router path (쿼리 포함 가능) */
  href?: string
}

/** type → 바로가기 목적지. href가 없을 때 사용. notice/maintenance/update는 없음. */
const TYPE_HREF: Record<NotifType, string | null> = {
  notice: null,
  maintenance: null,
  update: null,
  terms: '/guide-doc?id=terms',
  energy: '/(tabs)',
  claim: '/(tabs)',
  diary: '/(tabs)/diary',
  chat: '/(tabs)/chat',
  attendance: '/(tabs)/attendance',
  mind: '/(tabs)/mind',
}

export function notificationDetailHref(id: string) {
  return `/notification-detail?id=${encodeURIComponent(id)}`
}

/**
 * 알림에 연결된 화면 경로 (있으면 상세에서 「바로가기」 표시).
 * 공지·점검·업데이트 등 본문만 있는 알림은 null.
 */
export function getNotificationActionHref(n: AppNotification): string | null {
  if (n.href) return n.href
  return TYPE_HREF[n.type] ?? null
}

/** 액션 경로가 없으면 상세 화면으로 */
export function resolveNotificationHref(n: AppNotification): string {
  return getNotificationActionHref(n) ?? notificationDetailHref(n.id)
}

export function getNotificationById(id: string): AppNotification | null {
  return DEMO_NOTIFICATIONS.find((n) => n.id === id) ?? null
}

export function markNotificationRead(id: string) {
  const n = DEMO_NOTIFICATIONS.find((x) => x.id === id)
  if (n) n.unread = false
}

export function markAllNotificationsRead() {
  for (const n of DEMO_NOTIFICATIONS) n.unread = false
}

/** 더미 알림 — 시안「앱 알림」기준 (서버 연동 전)
 * date는 YYYY-MM-DD. 목록에서는 2026.07.19 로 표시.
 */
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    category: 'notice',
    type: 'notice',
    title: '이벤트',
    body: '서비스 이용에 영향을 줄 수 있는 중요한 안내가 있어요. 내용을 확인해 주세요.',
    date: '2026-07-19',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n2',
    category: 'service',
    type: 'maintenance',
    title: '서비스 점검',
    body: '더 안정적인 이용을 위해 점검이 예정되어 있어요. 점검 시간에는 일부 기능을 이용하기 어려울 수 있어요.',
    date: '2026-07-19',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n3',
    category: 'service',
    type: 'energy',
    title: '에너지 부족',
    body: '에너지가 부족해요. 펫 홈에서 출석·일기로 에너지를 모아 보세요.',
    date: '2026-07-18',
    unread: true,
    icon: 'calendar',
    href: '/(tabs)',
  },
  {
    id: 'n4',
    category: 'notice',
    type: 'update',
    title: '업데이트',
    body: '새로운 버전이 준비됐어요. 안정적인 이용을 위해 최신 버전으로 업데이트해 주세요.',
    date: '2026-07-18',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n5',
    category: 'notice',
    type: 'terms',
    title: '이용약관 변경',
    body: '서비스 이용약관 내용이 변경됐어요. 계속 이용하기 전에 확인해 주세요.',
    date: '2026-02-21',
    unread: false,
    icon: 'bell',
    href: '/guide-doc?id=terms',
  },
  {
    id: 'n6',
    category: 'service',
    type: 'energy',
    title: '에너지 적립 불가',
    body: '지금은 에너지가 가득 차 있어요. 추가 보상은 보유 가능한 최대 수량까지만 적립돼요.',
    date: '2025-12-21',
    unread: false,
    icon: 'calendar',
    href: '/(tabs)',
  },
  {
    id: 'n7',
    category: 'service',
    type: 'energy',
    title: '에너지 일부 적립',
    body: '에너지가 가득 차서 받을 수 있는 만큼만 일부 적립됐어요.',
    date: '2025-12-01',
    unread: false,
    icon: 'calendar',
    href: '/(tabs)',
  },
  {
    id: 'n8',
    category: 'service',
    type: 'claim',
    title: '보상 수령 가능',
    body: '받을 수 있는 보상이 있어요. 펫 홈에서 확인해 주세요.',
    date: '2026-07-19',
    unread: true,
    icon: 'calendar',
    href: '/(tabs)',
  },
  {
    id: 'n9',
    category: 'service',
    type: 'attendance',
    title: '출석 체크',
    body: '오늘 아직 출석하지 않았어요. 출석하고 에너지를 받아 보세요.',
    date: '2026-07-18',
    unread: true,
    icon: 'calendar',
    href: '/(tabs)/attendance',
  },
  {
    id: 'n10',
    category: 'service',
    type: 'diary',
    title: '감정 일기',
    body: '오늘의 감정을 짧게 남겨 보면 마음이 한결 가벼워질 거예요.',
    date: '2026-07-18',
    unread: false,
    icon: 'bell',
    href: '/(tabs)/diary',
  },
  {
    id: 'n11',
    category: 'service',
    type: 'chat',
    title: '대화 알림',
    body: '펫이 이야기를 기다리고 있어요. 편하게 이야기해 보세요.',
    date: '2026-07-17',
    unread: false,
    icon: 'bell',
    href: '/(tabs)/chat',
  },
  {
    id: 'n12',
    category: 'service',
    type: 'mind',
    title: '마음챙김',
    body: '잠깐의 호흡·콘텐츠로 마음을 가다듬어 보세요.',
    date: '2026-07-17',
    unread: false,
    icon: 'bell',
    href: '/(tabs)/mind',
  },
]
