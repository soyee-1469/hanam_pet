export type NotifCategory = 'notice' | 'service'

export type AppNotification = {
  id: string
  category: NotifCategory
  title: string
  body: string
  date: string
  unread: boolean
  icon: 'bell' | 'calendar'
}

/** 더미 알림 — 시안「앱 알림」기준 (서버 연동 전) */
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    category: 'notice',
    title: '이벤트',
    body: '서비스 이용에 영향을 줄 수 있는 중요한 안내가 있어요. 내용을 확인해 주세요.',
    date: '2026-04-21',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n2',
    category: 'service',
    title: '서비스 점검',
    body: '더 안정적인 이용을 위해 점검이 예정되어 있어요. 점검 시간에는 일부 기능을 이용하기 어려울 수 있어요.',
    date: '2026-04-21',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n3',
    category: 'service',
    title: '에너지 부족',
    body: '서비스 이용에 영향을 줄 수 있는 중요한 안내가 있어요. 내용을 확인해 주세요.',
    date: '2026-04-21',
    unread: true,
    icon: 'calendar',
  },
  {
    id: 'n4',
    category: 'notice',
    title: '업데이트',
    body: '새로운 버전이 준비됐어요. 안정적인 이용을 위해 최신 버전으로 업데이트해 주세요.',
    date: '2026-04-21',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n5',
    category: 'notice',
    title: '이용약관 변경',
    body: '서비스 이용약관 내용이 변경됐어요. 계속 이용하기 전에 확인해 주세요.',
    date: '2026-02-21',
    unread: false,
    icon: 'bell',
  },
  {
    id: 'n6',
    category: 'service',
    title: '에너지 적립 불가',
    body: '지금은 에너지가 가득 차 있어요. 추가 보상은 보유 가능한 최대 수량까지만 적립돼요.',
    date: '2025-12-21',
    unread: false,
    icon: 'calendar',
  },
  {
    id: 'n7',
    category: 'service',
    title: '에너지 일부 적립',
    body: '에너지가 가득 차서 받을 수 있는 만큼만 일부 적립됐어요.',
    date: '2025-12-01',
    unread: false,
    icon: 'calendar',
  },
]
