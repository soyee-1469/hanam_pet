import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, type Href } from 'expo-router'
import { Bell, CalendarBlank, CaretLeft } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  DEMO_NOTIFICATIONS,
  markAllNotificationsRead,
  markNotificationRead,
  notificationDetailHref,
  type AppNotification,
  type NotifCategory,
} from '../lib/notifications'
import { showToast } from '../lib/toast'

type FilterId = 'all' | NotifCategory

type NotifSection = {
  key: string
  title: string
  data: AppNotification[]
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'notice', label: '공지' },
  { id: 'service', label: '서비스' },
]

/** 목록용 날짜 — 마인드 목록과 동일 (예: 2026.7.19) */
function formatNotifDate(iso: string) {
  const [y, m, day] = iso.split('-').map(Number)
  if (!y || !m || !day) return iso
  return `${y}.${m}.${day}`
}

function buildSections(items: AppNotification[]): NotifSection[] {
  const buckets = new Map<string, AppNotification[]>()
  for (const item of items) {
    const list = buckets.get(item.date)
    if (list) list.push(item)
    else buckets.set(item.date, [item])
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, data]) => ({
      key: date,
      title: formatNotifDate(date),
      data,
    }))
}

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [items, setItems] = useState<AppNotification[]>(DEMO_NOTIFICATIONS)

  useFocusEffect(
    useCallback(() => {
      setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    }, []),
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((n) => n.category === filter)
  }, [filter, items])

  const sections = useMemo(() => buildSections(filtered), [filtered])
  const unreadCount = useMemo(
    () => items.filter((n) => n.unread).length,
    [items],
  )

  const markAllRead = () => {
    if (unreadCount === 0) return
    markAllNotificationsRead()
    setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    showToast('모든 알림을 읽음 처리했어요')
  }

  const openItem = (item: AppNotification) => {
    markNotificationRead(item.id)
    setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    router.push(notificationDetailHref(item.id) as Href)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>알림</Text>
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
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const on = filter === f.id
          return (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, on ? styles.filterOn : styles.filterOff]}
            >
              <Text style={[styles.filterText, on && styles.filterTextOn]}>
                {f.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sections.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Bell size={28} color={Colors.textDisabled} weight="regular" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? '아직 알림이 없어요' : '해당 알림이 없어요'}
            </Text>
            <Text style={styles.emptyBody}>
              {filter === 'all'
                ? '새 소식이 오면 여기에 보여 드릴게요.'
                : '다른 카테고리를 선택해 보세요.'}
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.key}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((item) => {
                const dateLabel = formatNotifDate(item.date)
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.unread ? '읽지 않음, ' : ''}${item.title}, ${dateLabel}`}
                    onPress={() => openItem(item)}
                    style={({ pressed }) => [
                      styles.card,
                      item.unread && styles.cardUnread,
                      pressed && styles.pressed,
                      Platform.OS === 'web' && styles.cardWeb,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        item.unread ? styles.iconBoxUnread : styles.iconBoxRead,
                        styles.noPointer,
                      ]}
                    >
                      {item.icon === 'calendar' ? (
                        <CalendarBlank
                          size={22}
                          color={
                            item.unread ? Colors.selected : Colors.textSecondary
                          }
                          weight="regular"
                        />
                      ) : (
                        <Bell
                          size={22}
                          color={
                            item.unread ? Colors.selected : Colors.textSecondary
                          }
                          weight="regular"
                        />
                      )}
                    </View>
                    <View style={[styles.rowBody, styles.noPointer]}>
                      <View style={styles.rowTop}>
                        <Text
                          style={[
                            styles.rowTitle,
                            !item.unread && styles.rowTitleRead,
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.rowDate}>{dateLabel}</Text>
                      </View>
                      <Text
                        style={[
                          styles.rowBodyText,
                          !item.unread && styles.rowBodyTextRead,
                        ]}
                        numberOfLines={2}
                      >
                        {item.body}
                      </Text>
                    </View>
                    {item.unread ? (
                      <View
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                        style={[styles.unreadDot, styles.noPointer]}
                      />
                    ) : (
                      <View
                        style={[styles.unreadPlaceholder, styles.noPointer]}
                      />
                    )}
                  </Pressable>
                )
              })}
            </View>
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
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markAllBtn: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 8,
  },
  filterChip: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  filterOn: {
    backgroundColor: Colors.selected,
    borderColor: Colors.selected,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextOn: {
    color: Colors.buttonPrimaryText,
  },
  list: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  empty: {
    paddingTop: 64,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardWeb: {
    // @ts-expect-error RN Web cursor
    cursor: 'pointer',
  },
  noPointer: {
    pointerEvents: 'none',
  },
  cardUnread: {
    backgroundColor: Colors.cardRecessed,
    borderColor: Colors.sand,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: {
    backgroundColor: Colors.accentSoft,
  },
  iconBoxRead: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  rowTitleRead: {
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rowDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    fontVariant: ['tabular-nums'],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: Colors.accent,
  },
  unreadPlaceholder: {
    width: 8,
  },
  rowBodyText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  rowBodyTextRead: {
    color: Colors.textDisabled,
  },
})
