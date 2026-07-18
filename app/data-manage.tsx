import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CaretLeft,
  Copy,
  ChatCircle,
  CalendarHeart,
  Check,
  Trash,
  X,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import * as Clipboard from 'expo-clipboard'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { onboardingFooterStyle } from '../components/ui'
import { showToast } from '../lib/toast'

const ANON_ID_DISPLAY = 'anon_8f2c4b7e...a91'
const ANON_ID_FULL = 'anon_8f2c4b7e9d1ba91'

type DataItem = {
  id: string
  title: string
  count: number
  Icon: Icon
}

const INITIAL_ITEMS: DataItem[] = [
  { id: 'chat', title: '대화 기록', count: 24, Icon: ChatCircle },
  { id: 'diary', title: '마음일기', count: 17, Icon: CalendarHeart },
  { id: 'check', title: '자가검진 결과', count: 4, Icon: Check },
]

export default function DataManageScreen() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const total = items.reduce((sum, item) => sum + item.count, 0)
  const empty = total === 0

  const copyAnonId = async () => {
    try {
      await Clipboard.setStringAsync(ANON_ID_FULL)
      setCopied(true)
      showToast('클립보드에 복사되었어요')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      Alert.alert('복사 실패', '잠시 후 다시 시도해 주세요.')
    }
  }

  const confirmDelete = () => {
    setDeleting(true)
    setItems((prev) => prev.map((item) => ({ ...item, count: 0 })))
    setDeleting(false)
    setConfirmOpen(false)
    showToast('모든 데이터가 삭제되었어요')
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
        <Text style={styles.headerTitle}>데이터 관리</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>내 익명 식별자</Text>
        <View style={styles.card}>
          <View style={styles.anonRow}>
            <Text style={styles.anonId} numberOfLines={1}>
              {ANON_ID_DISPLAY}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="익명 식별자 복사"
              onPress={() => {
                void copyAnonId()
              }}
              style={({ pressed }) => [
                styles.copyBtn,
                pressed && styles.copyBtnPressed,
              ]}
            >
              <Copy
                size={16}
                color={copied ? Colors.selected : Colors.textSecondary}
                weight="bold"
              />
              <Text style={[styles.copyText, copied && styles.copyTextDone]}>
                {copied ? '복사됨' : '복사'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.anonHint}>
            모든 기록은 이 익명 식별자 기준으로 저장되며, 개인정보와 연결되지
            않습니다.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>데이터 항목</Text>
        <View style={styles.card}>
          {items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.dataRow, i < items.length - 1 && styles.rowDivider]}
            >
              <item.Icon size={20} color={Colors.textPrimary} weight="regular" />
              <Text style={styles.dataTitle}>{item.title}</Text>
              <Text style={styles.dataCount}>{item.count}건</Text>
            </View>
          ))}
        </View>

        {!empty ? (
          <View style={styles.dangerCard}>
            <Trash size={18} color={Colors.error} weight="regular" />
            <View style={styles.dangerCopy}>
              <Text style={styles.dangerTitle}>모든 데이터 삭제</Text>
              <Text style={styles.dangerBody}>
                삭제한 데이터는 복구할 수 없으며, 즉시 영구 파기됩니다.
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyNote}>삭제할 데이터가 없어요.</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="데이터 전체 삭제"
          disabled={empty || deleting}
          onPress={() => setConfirmOpen(true)}
          style={({ pressed }) => [
            styles.deleteBtn,
            (empty || deleting) && styles.deleteBtnDisabled,
            pressed && !empty && !deleting && styles.deleteBtnPressed,
          ]}
        >
          <Text
            style={[
              styles.deleteBtnText,
              (empty || deleting) && styles.deleteBtnTextDisabled,
            ]}
          >
            데이터 전체 삭제
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismiss}
            onPress={() => setConfirmOpen(false)}
          />
          <View style={styles.modalCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              onPress={() => setConfirmOpen(false)}
              style={styles.modalClose}
            >
              <X size={20} color={Colors.textSecondary} weight="bold" />
            </Pressable>
            <Text style={styles.modalTitle}>정말 삭제하시겠어요?</Text>
            <Text style={styles.modalBody}>
              삭제된 데이터는 복구할 수 없어요. 대화 기록, 마음일기, 자가검진
              결과가 모두 삭제됩니다.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmOpen(false)}
                style={({ pressed }) => [
                  styles.modalSecondary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalSecondaryText}>계속 보관하기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={deleting}
                onPress={confirmDelete}
                style={({ pressed }) => [
                  styles.modalDanger,
                  pressed && styles.deleteBtnPressed,
                ]}
              >
                <Text style={styles.modalDangerText}>삭제하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
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
    paddingBottom: 16,
  },
  sectionLabel: {
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    ...Shadows.elevation,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  anonId: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.creamyBeige,
  },
  copyBtnPressed: {
    opacity: 0.75,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  copyTextDone: {
    color: Colors.selected,
  },
  anonHint: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  dataTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dataCount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF0EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dangerCopy: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.error,
    marginBottom: 4,
  },
  dangerBody: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.error,
    lineHeight: 20,
    opacity: 0.9,
  },
  emptyNote: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  deleteBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EE',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  deleteBtnDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
    borderColor: Colors.border,
  },
  deleteBtnPressed: {
    opacity: 0.88,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  deleteBtnTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalDismiss: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    ...Shadows.elevation,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    paddingRight: 28,
  },
  modalBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    gap: 10,
  },
  modalSecondary: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamyBeige,
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalDanger: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
  },
  modalDangerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
