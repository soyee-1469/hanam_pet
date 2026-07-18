import type { ReactNode } from 'react'
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Shadows } from '../../constants/Colors'

/** 전체 오버레이 공통 — 팝업·시트 모두 동일 틴트 */
export const OVERLAY_SCRIM = 'rgba(91, 57, 39, 0.35)'

type ShellProps = {
  visible: boolean
  onRequestClose: () => void
  /** 배경 탭. false면 무시 */
  onBackdropPress?: (() => void) | false
  children: ReactNode
}

/**
 * 가운데 팝업 셸 — 확인·입력·알림
 * (삭제/이탈 ConfirmDialog, 외부링크, 이름 변경 등)
 */
export function CenterDialog({
  visible,
  onRequestClose,
  onBackdropPress,
  children,
  cardStyle,
}: ShellProps & { cardStyle?: StyleProp<ViewStyle> }) {
  const handleBackdrop =
    onBackdropPress === false
      ? undefined
      : (onBackdropPress ?? onRequestClose)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.centerRoot}>
        {handleBackdrop ? (
          <Pressable style={styles.dismissFill} onPress={handleBackdrop} />
        ) : (
          <View style={styles.dismissFill} />
        )}
        <View style={[styles.centerCard, cardStyle]}>{children}</View>
      </View>
    </Modal>
  )
}

/**
 * 바텀시트 셸 — 메뉴·약관·도움말·권한 안내
 */
export function BottomSheet({
  visible,
  onRequestClose,
  onBackdropPress,
  children,
  sheetStyle,
  showHandle = true,
}: ShellProps & {
  sheetStyle?: StyleProp<ViewStyle>
  showHandle?: boolean
}) {
  const insets = useSafeAreaInsets()
  const handleBackdrop =
    onBackdropPress === false
      ? undefined
      : (onBackdropPress ?? onRequestClose)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.sheetRoot}>
        {handleBackdrop ? (
          <Pressable style={styles.sheetDismiss} onPress={handleBackdrop} />
        ) : (
          <View style={styles.sheetDismiss} />
        )}
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
            sheetStyle,
          ]}
        >
          {showHandle ? <View style={styles.handle} /> : null}
          {children}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centerRoot: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dismissFill: {
    ...StyleSheet.absoluteFill,
  },
  centerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    ...Shadows.elevation,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: OVERLAY_SCRIM,
  },
  sheetDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 8,
    ...Shadows.elevation,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.sand,
    marginBottom: 10,
  },
})
