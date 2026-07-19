import { View, Text, Pressable, StyleSheet, Linking } from 'react-native'
import { Question } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { CenterDialog } from './ui/AppOverlay'

type PhotoPermissionDeniedDialogProps = {
  visible: boolean
  onClose: () => void
}

/** 사진 권한 거부 시 — 설정 유도 (가운데 팝업) */
export function PhotoPermissionDeniedDialog({
  visible,
  onClose,
}: PhotoPermissionDeniedDialogProps) {
  const openSettings = async () => {
    try {
      await Linking.openSettings()
    } catch {
      // ignore
    }
  }

  return (
    <CenterDialog visible={visible} onRequestClose={onClose}>
      <Text style={styles.header}>서비스 이용 알림</Text>
      <View style={styles.iconWrap}>
        <Question size={28} color={Colors.accent} weight="bold" />
      </View>
      <Text style={styles.title}>
        사진 권한이 없으면 사진첩에 번호를 저장할 수 없어요.
      </Text>
      <Text style={styles.body}>
        사진첩에 저장하기 기능을 원할 경우, [설정 &gt; 애플리케이션]에서 해당
        앱의 권한을 허용해 주세요.
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onClose}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>닫기</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정하러 가기"
          onPress={() => {
            void openSettings()
          }}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>설정하러 가기</Text>
        </Pressable>
      </View>
    </CenterDialog>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  primary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
  pressed: {
    opacity: 0.88,
  },
})
