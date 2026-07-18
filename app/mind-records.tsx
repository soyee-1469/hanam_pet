import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretLeft,
  CalendarHeart,
  Check,
  WarningCircle,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { ConfirmDialog } from '../components/ui'
import { showToast } from '../lib/toast'
import { clearMindCheckResults } from '../lib/mindCheckResults'

type ActionKind = 'check' | 'diary'

type ActionCard = {
  id: ActionKind
  title: string
  body: string
  cta: string
  confirmCta: string
  Icon: Icon
  confirmTitle: string
  confirmBody: string
  doneMessage: string
}

const ACTIONS: ActionCard[] = [
  {
    id: 'check',
    title: '마음 검사 초기화',
    body: '저장된 자가검진 결과를 모두 삭제합니다.',
    cta: '초기화하기',
    confirmCta: '초기화',
    Icon: Check,
    confirmTitle: '마음 검사 결과를 초기화할까요?',
    confirmBody:
      '저장된 모든 자가검진 결과가 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    doneMessage: '마음 검사 결과가 초기화되었어요.',
  },
  {
    id: 'diary',
    title: '마음일기 삭제',
    body: '저장된 마음일기를 모두 삭제합니다.',
    cta: '전체 삭제하기',
    confirmCta: '삭제',
    Icon: CalendarHeart,
    confirmTitle: '마음일기를 모두 삭제할까요?',
    confirmBody:
      '저장된 모든 마음일기가 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    doneMessage: '마음일기가 모두 삭제되었어요.',
  },
]

export default function MindRecordsScreen() {
  const [done, setDone] = useState<Record<ActionKind, boolean>>({
    check: false,
    diary: false,
  })
  const [pending, setPending] = useState<ActionCard | null>(null)

  const runDelete = () => {
    if (!pending) return
    const action = pending
    void (async () => {
      if (action.id === 'check') {
        await clearMindCheckResults()
      }
      setDone((prev) => ({ ...prev, [action.id]: true }))
      setPending(null)
      showToast(action.doneMessage)
    })()
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
        <Text style={styles.headerTitle}>마음 기록 관리</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ACTIONS.map((action) => {
          const cleared = done[action.id]
          return (
            <View key={action.id} style={styles.card}>
              <View style={styles.cardHead}>
                <action.Icon
                  size={22}
                  color={Colors.textPrimary}
                  weight="regular"
                />
                <Text style={styles.cardTitle}>{action.title}</Text>
              </View>
              <Text style={styles.cardBody}>{action.body}</Text>
              <View style={styles.warnRow}>
                <WarningCircle size={16} color={Colors.error} weight="fill" />
                <Text style={styles.warnText}>복구 불가</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={action.cta}
                disabled={cleared}
                onPress={() => setPending(action)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  cleared && styles.actionBtnDisabled,
                  pressed && !cleared && styles.actionBtnPressed,
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    cleared && styles.actionBtnTextDisabled,
                  ]}
                >
                  {cleared ? '삭제됨' : action.cta}
                </Text>
              </Pressable>
            </View>
          )
        })}

        <Text style={styles.footerNote}>
          삭제된 데이터는 복구할 수 없으니 신중하게 선택해 주세요.
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={pending != null}
        title={pending?.confirmTitle ?? ''}
        body={pending?.confirmBody ?? ''}
        cancelLabel="취소"
        confirmLabel={pending?.confirmCta ?? '확인'}
        tone="danger"
        onCancel={() => setPending(null)}
        onConfirm={runDelete}
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
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 18,
    ...Shadows.elevation,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  warnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: '#FFF0EE',
  },
  actionBtnDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.buttonDisabledBg,
  },
  actionBtnPressed: {
    opacity: 0.88,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  actionBtnTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  footerNote: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDisabled,
    lineHeight: 20,
  },
})
