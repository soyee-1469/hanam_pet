import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Check, FileText, Lock, Phone } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  ScreenHeader,
  SettingsGroup,
  SettingsRow,
  SurfaceCard,
} from '../components/ui'
import type { LegalDocId } from '../lib/legalDocs'

type DocRow = {
  id: LegalDocId
  title: string
  Icon: Icon
}

const DOC_ROWS: DocRow[] = [
  { id: 'terms', title: '이용약관', Icon: FileText },
  { id: 'privacy', title: '개인정보 처리방침', Icon: Lock },
  { id: 'sensitive', title: '민감정보 처리 고지', Icon: Lock },
  { id: 'oss', title: '오픈소스 라이선스', Icon: FileText },
]

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="이용 안내" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trust}>
          <Check size={18} color={Colors.selected} weight="bold" />
          <Text style={styles.trustText}>
            HP는 당신의 기록을 안전하게 보호합니다.
          </Text>
        </View>

        <SettingsGroup>
          {DOC_ROWS.map((row, i) => (
            <SettingsRow
              key={row.id}
              title={row.title}
              Icon={row.Icon}
              isLast={i === DOC_ROWS.length - 1}
              onPress={() =>
                router.push({
                  pathname: '/guide-doc',
                  params: { id: row.id },
                })
              }
            />
          ))}
        </SettingsGroup>

        <Text style={styles.sectionLabel}>고객 지원</Text>
        <SurfaceCard>
          <SettingsRow
            title="고객 지원 · 상담 안내"
            subtitle="하남시 센터 · 전국 긴급 연락처"
            Icon={Phone}
            isLast
            onPress={() => router.push('/support')}
          />
        </SurfaceCard>
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
    paddingBottom: Layout.contentPaddingBottom + 8,
    gap: 0,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Layout.blockGap,
    paddingHorizontal: 4,
  },
  trustText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
})
