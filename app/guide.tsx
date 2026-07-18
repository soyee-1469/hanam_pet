import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretLeft,
  CaretRight,
  Check,
  FileText,
  Lock,
  Phone,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
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
        <Text style={styles.headerTitle}>이용 안내</Text>
      </View>

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

        <View style={styles.card}>
          {DOC_ROWS.map((row, i) => (
            <Pressable
              key={row.id}
              accessibilityRole="button"
              accessibilityLabel={row.title}
              onPress={() =>
                router.push({
                  pathname: '/guide-doc',
                  params: { id: row.id },
                })
              }
              style={({ pressed }) => [
                styles.row,
                i < DOC_ROWS.length - 1 && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <row.Icon size={22} color={Colors.textPrimary} weight="regular" />
              <Text style={styles.rowTitle}>{row.title}</Text>
              <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>고객 지원</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="정신건강 상담 센터 안내"
          onPress={() => router.push('/support')}
          style={({ pressed }) => [
            styles.supportCard,
            pressed && styles.rowPressed,
          ]}
        >
          <Phone size={22} color={Colors.textPrimary} weight="regular" />
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>고객 지원 · 상담 안내</Text>
            <Text style={styles.supportSub}>하남시 센터 · 전국 긴급 연락처</Text>
          </View>
          <CaretRight size={16} color={Colors.textDisabled} weight="bold" />
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
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 32,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  trustText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 20,
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
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Shadows.elevation,
  },
  supportCopy: {
    flex: 1,
    minWidth: 0,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  supportSub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
})
