import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import { CaretRight } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, HeaderTitleStyle, tabBarReserveHeight } from '../../constants/Layout'
import { TypeStyle } from '../../constants/Typography'
import { TabSceneGate } from '../../components/TabSceneGate'

type RowKind = 'link' | 'version'

type SettingsRowItem = {
  id: string
  title: string
  kind?: RowKind
  /** version row trailing label */
  trailing?: string
}

type SettingsSection = {
  id: string
  title?: string
  rows: SettingsRowItem[]
}

const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.4.0'

const SECTIONS: SettingsSection[] = [
  {
    id: 'profile',
    title: '내 정보',
    rows: [
      { id: 'recovery', title: '내 기록 가져오기 번호' },
      { id: 'nickname', title: '내 닉네임' },
      { id: 'pet', title: '내 펫 관리' },
    ],
  },
  {
    id: 'records',
    title: '기록 관리',
    rows: [
      { id: 'new-chat', title: '새로운 대화 시작하기' },
      { id: 'new-diary', title: '새로운 마음일기 쓰기' },
      { id: 'new-mind', title: '새로운 마음 살피기' },
    ],
  },
  {
    id: 'guide',
    title: '이용 안내',
    rows: [
      { id: 'terms', title: '이용약관' },
      { id: 'privacy', title: '개인정보처리방침' },
      { id: 'oss', title: '오픈소스 라이선스' },
      {
        id: 'version',
        title: `앱 버전 ${APP_VERSION}`,
        kind: 'version',
        trailing: '업데이트',
      },
    ],
  },
  {
    id: 'support',
    rows: [{ id: 'support', title: '고객 지원' }],
  },
]

function SettingsRow({
  item,
  isLast,
  onPress,
}: {
  item: SettingsRowItem
  isLast: boolean
  onPress?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isVersion = item.kind === 'version'

  if (isVersion) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.trailing ?? ''}`}
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
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.trailing ? (
            <Text style={styles.rowTrailingUpdate}>{item.trailing}</Text>
          ) : null}
          <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
        </View>
      </Pressable>
    )
  }

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
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
      </View>
    </Pressable>
  )
}

export default function MoreScreen() {
  return (
    <TabSceneGate>
      <MoreScreenBody />
    </TabSceneGate>
  )
}

function MoreScreenBody() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)

  const onRowPress = (id: string) => {
    switch (id) {
      case 'recovery':
        router.push('/recovery-code')
        return
      case 'nickname':
        router.push('/account')
        return
      case 'pet':
        router.push('/pet-manage')
        return
      case 'new-chat':
        router.push({ pathname: '/record-reset', params: { kind: 'chat' } })
        return
      case 'new-diary':
        router.push({ pathname: '/record-reset', params: { kind: 'diary' } })
        return
      case 'new-mind':
        router.push({ pathname: '/record-reset', params: { kind: 'mind' } })
        return
      case 'terms':
        router.push({ pathname: '/guide-doc', params: { id: 'terms' } })
        return
      case 'privacy':
        router.push({ pathname: '/guide-doc', params: { id: 'privacy' } })
        return
      case 'oss':
        router.push({ pathname: '/guide-doc', params: { id: 'oss' } })
        return
      case 'version':
        // 스토어 연결 전 — 안내만
        return
      case 'support':
        router.push('/support')
        return
      default:
        return
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            {section.title ? (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            ) : null}
            <View style={styles.card}>
              {section.rows.map((row, i) => (
                <SettingsRow
                  key={row.id}
                  item={row}
                  isLast={i === section.rows.length - 1}
                  onPress={() => onRowPress(row.id)}
                />
              ))}
            </View>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="회원탈퇴"
          onPress={() => router.push('/withdraw')}
          hitSlop={8}
          style={({ pressed }) => [
            styles.withdrawBtn,
            pressed && styles.rowPressed,
          ]}
        >
          <Text style={styles.withdrawText}>회원탈퇴</Text>
        </Pressable>
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
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    paddingHorizontal: Layout.screenPaddingH,
  },
  title: {
    color: Colors.textPrimary,
    ...HeaderTitleStyle.tab,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    marginLeft: 4,
    ...TypeStyle.sectionTitle,
    fontWeight: '800',
    color: Colors.textPrimary,
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
    minHeight: 56,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    gap: 10,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowHover: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowTrailing: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rowTrailingUpdate: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  withdrawBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: Layout.headerPaddingH,
    marginTop: 4,
  },
  withdrawText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
