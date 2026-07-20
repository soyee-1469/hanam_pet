import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CaretRight, Question } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { ConfirmDialog, ScreenHeader } from '../components/ui'
import { clearDiaryRecords } from '../lib/diaryRecords'
import { clearMindCheckResults } from '../lib/mindCheckResults'
import { showToast } from '../lib/toast'

type ResetKind = 'diary' | 'mind'

type ResetConfig = {
  title: string
  actionTitle: string
  actionDesc: string
  confirmTitle: string
  confirmBody: string
  confirmLabel: string
  doneMessage: string
  afterHref: string
  clear: () => void | Promise<void>
}

const WARNING =
  '삭제하거나 초기화를 하면 하남이와 처음 만난 날의 상태로 돌아가요. 기록을 다시 찾을 수 없으니 신중하게 해주세요.'

const CONFIG: Record<ResetKind, ResetConfig> = {
  diary: {
    title: '새로운 마음일기 쓰기',
    actionTitle: '새로운 마음일기 쓰기',
    actionDesc:
      '지나간 마음일기를 기억 저편으로 모두 비우고 새로운 일기장에 적어요.',
    confirmTitle: '마음일기를 모두 비울까요?',
    confirmBody:
      '저장된 모든 마음일기가 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    confirmLabel: '비울래요',
    doneMessage: '마음일기를 비웠어요. 새 일기를 써 볼까요?',
    afterHref: '/diary-write',
    clear: () => clearDiaryRecords(),
  },
  mind: {
    title: '새로운 마음 살피기',
    actionTitle: '새로운 마음 살피기',
    actionDesc:
      '그동안 살펴본 마음 상태 기록을 모두 비우고 처음으로 돌아가요.',
    confirmTitle: '마음 상태 기록을 모두 비울까요?',
    confirmBody:
      '저장된 모든 자가검진 결과가 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    confirmLabel: '비울래요',
    doneMessage: '마음 살피기 기록을 비웠어요.',
    afterHref: '/mind-check-intro',
    clear: () => clearMindCheckResults(),
  },
}

function parseKind(raw: string | string[] | undefined): ResetKind | null {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === 'diary' || v === 'mind') return v
  return null
}

export default function RecordResetScreen() {
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>()
  const kind = parseKind(kindParam)
  const config = kind ? CONFIG[kind] : null
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const a11yAction = useMemo(
    () => config?.actionTitle ?? '기록 초기화',
    [config?.actionTitle],
  )

  if (!config) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="기록 관리" onBack={() => router.back()} />
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>잘못된 접근이에요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const runClear = () => {
    if (busy) return
    setBusy(true)
    void (async () => {
      try {
        await config.clear()
        setConfirmOpen(false)
        showToast(config.doneMessage)
        router.replace(config.afterHref as never)
      } catch {
        setBusy(false)
        setConfirmOpen(false)
        showToast('잠시 후 다시 시도해 주세요')
      }
    })()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={config.title} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warnBox}>
          <View style={styles.warnIcon}>
            <Question size={18} color={Colors.textSecondary} weight="bold" />
          </View>
          <Text style={styles.warnText}>{WARNING}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={a11yAction}
          onPress={() => setConfirmOpen(true)}
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionPressed,
          ]}
        >
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>{config.actionTitle}</Text>
            <Text style={styles.actionDesc}>{config.actionDesc}</Text>
          </View>
          <CaretRight size={18} color={Colors.textDisabled} weight="bold" />
        </Pressable>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title={config.confirmTitle}
        body={config.confirmBody}
        cancelLabel="취소"
        confirmLabel={config.confirmLabel}
        tone="danger"
        onCancel={() => {
          if (!busy) setConfirmOpen(false)
        }}
        onConfirm={runClear}
      />
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
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  warnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
    marginTop: 1,
  },
  warnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 18,
    ...Shadows.elevation,
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  fallback: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 24,
  },
  fallbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
