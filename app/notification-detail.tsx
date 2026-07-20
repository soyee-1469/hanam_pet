import { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router'
import { Bell, CalendarBlank } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, ScreenHeader } from '../components/ui'
import {
  getNotificationActionHref,
  getNotificationById,
  markNotificationRead,
} from '../lib/notifications'
import { formatDate } from '../lib/dateFormat'

function formatDetailDate(iso: string) {
  return formatDate(iso)
}

export default function NotificationDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string }>()
  const id = typeof idParam === 'string' ? idParam : idParam?.[0]
  const [item, setItem] = useState(() =>
    id ? getNotificationById(id) : null,
  )

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setItem(null)
        return
      }
      markNotificationRead(id)
      setItem(getNotificationById(id))
    }, [id]),
  )

  const actionHref = useMemo(
    () => (item ? getNotificationActionHref(item) : null),
    [item],
  )

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="알림" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>알림을 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="알림 상세" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            {item.icon === 'calendar' ? (
              <CalendarBlank
                size={22}
                color={Colors.selected}
                weight="regular"
              />
            ) : (
              <Bell size={22} color={Colors.selected} weight="regular" />
            )}
          </View>
          <Text style={styles.date}>{formatDetailDate(item.date)}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.body}</Text>
      </ScrollView>

      {actionHref ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="바로가기"
            emphasized
            onPress={() => router.push(actionHref as Href)}
          />
        </View>
      ) : null}
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
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: 40,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  content: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 12,
    paddingTop: 8,
  },
})
