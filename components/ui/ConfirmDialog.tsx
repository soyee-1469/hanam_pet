import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { TypeStyle } from '../../constants/Typography'
import { EojeolText } from '../EojeolText'
import { CenterDialog } from './AppOverlay'
import {
  DialogIconBadge,
  type DialogIconTone,
} from './DialogIconBadge'

type CancelTone = 'outline' | 'primary'
type ActionsOrder = 'cancel-confirm' | 'confirm-cancel'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  body: string
  cancelLabel?: string
  confirmLabel?: string
  /**
   * danger=삭제 · warning=이탈/주의 · info=안내 · withdraw=회원탈퇴
   * 모두 같은 원형 뱃지 패턴, 아이콘만 톤별 통일
   */
  tone?: DialogIconTone
  /** outline=테두리 취소, primary=코랄 면(계속 이용 등) */
  cancelTone?: CancelTone
  /** 기본 cancel→confirm. 탈퇴 확인처럼 위험 액션을 왼쪽에 둘 때 confirm-cancel */
  actionsOrder?: ActionsOrder
  /** 톤 기본 아이콘 덮어쓰기 */
  Icon?: Icon
  onCancel: () => void
  onConfirm: () => void
  /** 배경 탭 — 기본은 onCancel. 이탈 확인은 유지(onConfirm)에 두는 게 안전 */
  onBackdropPress?: () => void
}

/** 가운데 팝업 — 삭제·이탈·탈퇴·안내 등 신중한 확인용 (바텀시트와 구분) */
export function ConfirmDialog({
  visible,
  title,
  body,
  cancelLabel = '나중에 할게요',
  confirmLabel = '지울래요',
  tone = 'danger',
  cancelTone = 'outline',
  actionsOrder = 'cancel-confirm',
  Icon,
  onCancel,
  onConfirm,
  onBackdropPress,
}: ConfirmDialogProps) {
  const isDanger = tone === 'danger' || tone === 'withdraw'
  const confirmFirst = actionsOrder === 'confirm-cancel'

  const cancelBtn = (
    <Pressable
      key="cancel"
      accessibilityRole="button"
      accessibilityLabel={cancelLabel}
      onPress={onCancel}
      style={({ pressed }) => [
        cancelTone === 'primary' ? styles.primary : styles.secondary,
        pressed &&
          (cancelTone === 'primary' ? styles.actionPressed : styles.pressed),
      ]}
    >
      <Text
        style={
          cancelTone === 'primary' ? styles.confirmText : styles.secondaryText
        }
      >
        {cancelLabel}
      </Text>
    </Pressable>
  )

  const confirmBtn = (
    <Pressable
      key="confirm"
      accessibilityRole="button"
      accessibilityLabel={confirmLabel}
      onPress={onConfirm}
      style={({ pressed }) => [
        isDanger ? styles.danger : styles.primary,
        pressed && styles.actionPressed,
      ]}
    >
      <Text style={styles.confirmText}>{confirmLabel}</Text>
    </Pressable>
  )

  return (
    <CenterDialog
      visible={visible}
      onRequestClose={onCancel}
      onBackdropPress={onBackdropPress ?? onCancel}
      cardStyle={styles.cardAlign}
    >
      <DialogIconBadge tone={tone} Icon={Icon} />
      <EojeolText style={styles.title}>{title}</EojeolText>
      <EojeolText style={styles.body}>{body}</EojeolText>
      <View style={styles.actions}>
        {confirmFirst ? (
          <>
            {confirmBtn}
            {cancelBtn}
          </>
        ) : (
          <>
            {cancelBtn}
            {confirmBtn}
          </>
        )}
      </View>
    </CenterDialog>
  )
}

const styles = StyleSheet.create({
  cardAlign: {
    alignItems: 'center',
  },
  title: {
    ...TypeStyle.modalTitle,
    fontSize: TypeStyle.screenTitle.fontSize,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  body: {
    ...TypeStyle.bodySecondary,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  secondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  danger: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
  },
  primary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
  pressed: {
    opacity: 0.88,
  },
  actionPressed: {
    opacity: 0.92,
  },
})
