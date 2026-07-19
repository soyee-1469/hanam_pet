import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import { Trash, Warning } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Typography'
import { CenterDialog } from './AppOverlay'

type ConfirmTone = 'danger' | 'warning'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  body: string
  cancelLabel?: string
  confirmLabel?: string
  /** danger=삭제(코랄), warning=이탈 경고(노랑+주황 CTA) */
  tone?: ConfirmTone
  Icon?: Icon
  onCancel: () => void
  onConfirm: () => void
  /** 배경 탭 — 기본은 onCancel. 이탈 확인은 유지(onConfirm)에 두는 게 안전 */
  onBackdropPress?: () => void
}

/** 가운데 팝업 — 삭제·이탈 등 신중한 확인용 (바텀시트와 구분) */
export function ConfirmDialog({
  visible,
  title,
  body,
  cancelLabel = '나중에 할게요',
  confirmLabel = '지울래요',
  tone = 'danger',
  Icon,
  onCancel,
  onConfirm,
  onBackdropPress,
}: ConfirmDialogProps) {
  const isDanger = tone === 'danger'
  const Glyph = Icon ?? (isDanger ? Trash : Warning)
  const iconColor = isDanger ? Colors.error : Colors.accent

  return (
    <CenterDialog
      visible={visible}
      onRequestClose={onCancel}
      onBackdropPress={onBackdropPress ?? onCancel}
      cardStyle={styles.cardAlign}
    >
      <View
        style={[
          styles.iconWrap,
          isDanger ? styles.iconWrapDanger : styles.iconWrapWarning,
        ]}
      >
        <Glyph size={28} color={iconColor} weight="regular" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={onCancel}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>{cancelLabel}</Text>
        </Pressable>
        <Pressable
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
      </View>
    </CenterDialog>
  )
}

const styles = StyleSheet.create({
  cardAlign: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconWrapDanger: {
    backgroundColor: '#FFF0EE',
  },
  iconWrapWarning: {
    backgroundColor: Colors.accentSoft,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
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
    fontFamily: Fonts.uiBold,
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
    fontFamily: Fonts.uiBold,
    color: Colors.buttonPrimaryText,
  },
  pressed: {
    opacity: 0.88,
  },
  actionPressed: {
    opacity: 0.92,
  },
})
