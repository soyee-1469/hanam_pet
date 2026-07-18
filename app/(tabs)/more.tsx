import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  User,
  FileText,
  Headset,
  Database,
  Info,
  SignOut,
  XSquare,
  CaretRight,
  CalendarHeart,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'

type MenuItem = {
  id: string
  title: string
  sub?: string
  Icon: Icon
  danger?: boolean
}

const MENU_GROUPS: MenuItem[][] = [
  [
    { id: 'account', title: '계정', sub: '닉네임 변경', Icon: User },
    { id: 'guide', title: '이용 안내', sub: '약관·정책·라이선스', Icon: FileText },
  ],
  [
    { id: 'support', title: '고객 지원', sub: '상담·긴급 연락처', Icon: Headset },
    {
      id: 'data',
      title: '데이터 관리',
      sub: '식별자 확인·데이터 삭제',
      Icon: Database,
    },
    {
      id: 'records',
      title: '마음 기록 관리',
      sub: '일기·검사 삭제',
      Icon: CalendarHeart,
    },
    { id: 'app', title: '앱 정보', sub: '버전 1.0.0', Icon: Info },
  ],
  [
    { id: 'logout', title: '로그아웃', Icon: SignOut },
    { id: 'withdraw', title: '계정 탈퇴', Icon: XSquare, danger: true },
  ],
]

function SettingsRow({
  item,
  isLast,
  onPress,
}: {
  item: MenuItem
  isLast: boolean
  onPress: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <View
        style={[
          styles.row,
          !isLast && styles.rowDivider,
          hovered && styles.rowHover,
        ]}
      >
        <View style={styles.rowIcon}>
          <item.Icon
            size={22}
            color={item.danger ? Colors.error : Colors.textPrimary}
            weight="regular"
          />
        </View>
        <View style={styles.rowCopy}>
          <Text
            style={[styles.rowTitle, item.danger && styles.rowTitleDanger]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.sub ? (
            <Text style={styles.rowSub} numberOfLines={1}>
              {item.sub}
            </Text>
          ) : null}
        </View>
        <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
      </View>
    </Pressable>
  )
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)

  const onMenuPress = (item: MenuItem) => {
    if (item.id === 'account') {
      router.push('/account')
      return
    }
    if (item.id === 'guide') {
      router.push('/guide')
      return
    }
    if (item.id === 'data') {
      router.push('/data-manage')
      return
    }
    if (item.id === 'records') {
      router.push('/mind-records')
      return
    }
    if (item.id === 'support') {
      router.push('/support')
      return
    }
    if (item.id === 'logout') {
      Alert.alert('로그아웃', '로그아웃할까요?', [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive' },
      ])
      return
    }
    if (item.id === 'withdraw') {
      router.push('/withdraw')
      return
    }
    Alert.alert(item.title, '더미 화면입니다.')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>계정과 이용 안내를 관리해요</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>펫</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileTitle}>몽이와 함께하는 중</Text>
            <Text style={styles.profileSub}>익명 사용자 · 가입 24일째</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.4</Text>
          </View>
        </View>

        {MENU_GROUPS.map((group, gi) => (
          <View key={gi} style={styles.card}>
            {group.map((item, ii) => (
              <SettingsRow
                key={item.id}
                item={item}
                isLast={ii === group.length - 1}
                onPress={() => onMenuPress(item)}
              />
            ))}
          </View>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  header: {
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    paddingHorizontal: Layout.screenPaddingH,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadows.elevation,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.buttonPrimaryText,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowHover: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowTitleDanger: {
    color: Colors.error,
  },
  rowSub: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
})
