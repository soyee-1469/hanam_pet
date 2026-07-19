import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { OVERLAY_SCRIM } from '../components/ui/AppOverlay'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { Fonts } from '../constants/Typography'
import {
  DEMO_NOTIFICATIONS,
  getNotificationActionHref,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotifCategory,
} from '../lib/notifications'
import { showToast } from '../lib/toast'

type FilterId = 'all' | NotifCategory
type DayGroup = 'today' | 'yesterday' | 'earlier'

type NotifSection = {
  key: DayGroup
  title: string
  data: AppNotification[]
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'notice', label: '공지' },
  { id: 'service', label: '서비스' },
]

const GROUP_ORDER: DayGroup[] = ['today', 'yesterday', 'earlier']
const GROUP_LABEL: Record<DayGroup, string> = {
  today: '오늘',
  yesterday: '어제',
  earlier: '이전',
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseIsoDate(iso: string) {
  const [y, m, day] = iso.split('-').map(Number)
  if (!y || !m || !day) return null
  return new Date(y, m - 1, day)
}

function dayGroupOf(iso: string, now = new Date()): DayGroup {
  const date = parseIsoDate(iso)
  if (!date) return 'earlier'
  const today = startOfDay(now)
  const target = startOfDay(date)
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return 'earlier'
}

function formatNotifDate(iso: string, group: DayGroup) {
  const date = parseIsoDate(iso)
  if (!date) return iso
  if (group === 'today') return '오늘'
  if (group === 'yesterday') return '어제'
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function formatModalDate(iso: string) {
  const date = parseIsoDate(iso)
  if (!date) return iso
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

function buildSections(items: AppNotification[]): NotifSection[] {
  const buckets: Record<DayGroup, AppNotification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  }
  for (const item of items) {
    buckets[dayGroupOf(item.date)].push(item)
  }
  return GROUP_ORDER.filter((key) => buckets[key].length > 0).map((key) => ({
    key,
    title: GROUP_LABEL[key],
    data: buckets[key],
  }))
}

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [items, setItems] = useState<AppNotification[]>(DEMO_NOTIFICATIONS)
  const [selected, setSelected] = useState<AppNotification | null>(null)
  /** Delay arming backdrop so the opening click cannot immediately dismiss. */
  const [scrimArmed, setScrimArmed] = useState(false)

  useEffect(() => {
    if (!selected) {
      setScrimArmed(false)
      return
    }
    const id = requestAnimationFrame(() => {
      setScrimArmed(true)
    })
    return () => cancelAnimationFrame(id)
  }, [selected])

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
  const actionHref = selected ? getNotificationActionHref(selected) : null

  const markAllRead = () => {
    if (unreadCount === 0) return
    markAllNotificationsRead()
    setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    showToast('모든 알림을 읽음 처리했어요')
  }

  const openItem = (item: AppNotification) => {
    markNotificationRead(item.id)
    setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    setSelected({ ...item, unread: false })
  }

  const closeModal = () => setSelected(null)

  const goToLinked = () => {
    if (!actionHref) return
    closeModal()
    router.push(actionHref as Href)
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
                const dateLabel = formatNotifDate(item.date, section.key)
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

      {selected ? (
        <View
          style={styles.detailOverlay}
          accessibilityViewIsModal
          importantForAccessibility="yes"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            disabled={!scrimArmed}
            onPress={scrimArmed ? closeModal : undefined}
            style={styles.detailScrim}
          />
          <View style={styles.detailCard}>
            <View style={styles.modalIconRow}>
              <View style={styles.modalIconBox}>
                {selected.icon === 'calendar' ? (
                  <CalendarBlank
                    size={22}
                    color={Colors.selected}
                    weight="regular"
                  />
                ) : (
                  <Bell size={22} color={Colors.selected} weight="regular" />
                )}
              </View>
              <Text style={styles.modalDate}>
                {formatModalDate(selected.date)}
              </Text>
            </View>
            <Text style={styles.modalTitle}>{selected.title}</Text>
            <Text style={styles.modalBody}>{selected.body}</Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="닫기"
                onPress={closeModal}
                style={({ pressed }) => [
                  actionHref ? styles.modalSecondary : styles.modalPrimaryFull,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={
                    actionHref
                      ? styles.modalSecondaryText
                      : styles.modalPrimaryText
                  }
                >
                  닫기
                </Text>
              </Pressable>
              {actionHref ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="바로가기"
                  onPress={goToLinked}
                  style={({ pressed }) => [
                    styles.modalPrimary,
                    pressed && styles.actionPressed,
                  ]}
                >
                  <Text style={styles.modalPrimaryText}>바로가기</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    // Anchor for in-screen detail overlay
    position: 'relative',
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
    fontFamily: Fonts.uiBold,
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
    fontFamily: Fonts.uiSemiBold,
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
    fontFamily: Fonts.uiSemiBold,
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
    fontFamily: Fonts.uiSemiBold,
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
    fontFamily: Fonts.uiBold,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
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
    fontFamily: Fonts.uiBold,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  rowTitleRead: {
    fontFamily: Fonts.uiSemiBold,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rowDate: {
    fontSize: 12,
    fontFamily: Fonts.uiMedium,
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
    fontFamily: Fonts.uiMedium,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  rowBodyTextRead: {
    color: Colors.textDisabled,
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: OVERLAY_SCRIM,
    ...(Platform.OS === 'web'
      ? ({ position: 'fixed', inset: 0, zIndex: 10000 } as object)
      : null),
  },
  detailScrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  detailCard: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    ...Shadows.elevation,
  },
  modalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
  },
  modalDate: {
    fontSize: 13,
    fontFamily: Fonts.uiMedium,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  modalSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalSecondaryText: {
    fontSize: 15,
    fontFamily: Fonts.uiBold,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  modalPrimaryFull: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  modalPrimaryText: {
    fontSize: 15,
    fontFamily: Fonts.uiBold,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
  actionPressed: {
    opacity: 0.92,
  },
})
