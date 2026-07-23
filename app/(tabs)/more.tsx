import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import { Colors } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { TabSceneGate } from '../../components/TabSceneGate'
import {
  DangerTextLink,
  SettingsGroup,
  SettingsRow,
  TabScreenTitle,
} from '../../components/ui'

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
    ],
  },
  {
    id: 'records',
    title: '기록 관리',
    rows: [
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
        trailing: '최신 버전',
      },
    ],
  },
  {
    id: 'support',
    rows: [{ id: 'support', title: '고객 지원' }],
  },
]

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
      case 'support':
        router.push('/support')
        return
      default:
        return
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TabScreenTitle title="설정" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <SettingsGroup key={section.id} title={section.title}>
            {section.rows.map((row, i) => (
              <SettingsRow
                key={row.id}
                title={row.title}
                trailing={row.trailing}
                variant={row.kind === 'version' ? 'version' : 'link'}
                isLast={i === section.rows.length - 1}
                onPress={
                  row.kind === 'version'
                    ? undefined
                    : () => onRowPress(row.id)
                }
              />
            ))}
          </SettingsGroup>
        ))}

        <DangerTextLink
          label="회원탈퇴"
          onPress={() => router.push('/withdraw')}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: Layout.sectionGapLg,
  },
})
