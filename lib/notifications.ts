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

/** 더미 알림 — 서버 연동 전 */
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    category: 'notice',
    title: '이벤트',
    body: '서비스 이용에 영향을 줄 수 있는 중요한 안내가 있어요. 자세히 확인해 주세요.',
    date: '2026-04-21',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n2',
    category: 'service',
    title: '서비스 점검',
    body: '더 안정적인 이용을 위해 점검이 예정되어 있어요. 이용에 참고해 주세요.',
    date: '2026-04-18',
    unread: true,
    icon: 'bell',
  },
  {
    id: 'n3',
    category: 'service',
    title: '에너지 부족',
    body: '대화 에너지가 부족해요. 나의 펫에서 사료주기·놀아주기로 채워 보세요.',
    date: '2026-04-15',
    unread: false,
    icon: 'calendar',
  },
  {
    id: 'n4',
    category: 'notice',
    title: '업데이트',
    body: '새로운 버전이 준비됐어요. 안정적인 이용을 위해 업데이트를 권장해요.',
    date: '2026-04-10',
    unread: false,
    icon: 'bell',
  },
  {
    id: 'n5',
    category: 'notice',
    title: '이용약관 변경',
    body: '서비스 이용약관 내용이 변경됐어요. 변경된 내용을 확인해 주세요.',
    date: '2026-04-05',
    unread: false,
    icon: 'bell',
  },
  {
    id: 'n6',
    category: 'service',
    title: '에너지 적립 불가',
    body: '지금은 에너지가 가득 차 있어요. 에너지를 사용한 뒤 다시 받아 보세요.',
    date: '2026-04-02',
    unread: true,
    icon: 'calendar',
  },
  {
    id: 'n7',
    category: 'service',
    title: '에너지 일부 적립',
    body: '에너지가 가득 차서 받을 수 있는 만큼만 적립됐어요.',
    date: '2026-03-28',
    unread: false,
    icon: 'calendar',
  },
]
