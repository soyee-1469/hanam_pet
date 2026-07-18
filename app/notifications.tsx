import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Bell, CalendarBlank, CaretLeft } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  DEMO_NOTIFICATIONS,
  type AppNotification,
  type NotifCategory,
} from '../lib/notifications'
import { showToast } from '../lib/toast'

type FilterId = 'all' | NotifCategory

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'notice', label: '공지' },
  { id: 'service', label: '서비스' },
]

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [items, setItems] = useState<AppNotification[]>(DEMO_NOTIFICATIONS)

  useFocusEffect(
    useCallback(() => {
      setItems(DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
    }, []),
  )

  const list = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((n) => n.category === filter)
  }, [filter, items])

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
    showToast('모든 알림을 읽음 처리했어요')
  }

  const openItem = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    )
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
          hitSlop={8}
          onPress={markAllRead}
          style={({ pressed }) => [styles.markAllBtn, pressed && styles.pressed]}
        >
          <Text style={styles.markAllText}>모두 읽음</Text>
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

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>해당 알림이 없어요.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => openItem(item.id)}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.iconBox}>
              {item.icon === 'calendar' ? (
                <CalendarBlank
                  size={22}
                  color={Colors.primary}
                  weight="regular"
                />
              ) : (
                <Bell size={22} color={Colors.primary} weight="regular" />
              )}
            </View>
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.meta}>
                  <Text style={styles.rowDate}>{item.date}</Text>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </View>
              <Text style={styles.rowBodyText} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
          </Pressable>
        )}
      />
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
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  markAllBtn: {
    minWidth: 64,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  filterOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextOn: {
    color: Colors.buttonPrimaryText,
  },
  list: {
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 48,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: Layout.screenPaddingH,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
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
    backgroundColor: Colors.primary,
  },
  rowBodyText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
})
