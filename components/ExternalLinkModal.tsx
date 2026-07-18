import { Modal, View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native'
import { ArrowUpRight } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'

type ExternalLinkModalProps = {
  visible: boolean
  url: string
  onClose: () => void
  /** 확인 후 추가 콜백 (선택) */
  onOpened?: () => void
}

function truncateUrl(url: string, max = 36) {
  if (url.length <= max) return url
  return `${url.slice(0, max - 1)}…`
}

export async function openExternalUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert('안내', '이 링크를 열 수 없어요.')
      return false
    }
    await Linking.openURL(url)
    return true
  } catch {
    Alert.alert('연결 실패', '잠시 후 다시 시도해 주세요.')
    return false
  }
}

/** 외부 웹 페이지 이동 전 확인 모달 */
export function ExternalLinkModal({
  visible,
  url,
  onClose,
  onOpened,
}: ExternalLinkModalProps) {
  const go = async () => {
    const ok = await openExternalUrl(url)
    onClose()
    if (ok) onOpened?.()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <ArrowUpRight
              size={26}
              color={Colors.selected}
              weight="bold"
            />
          </View>
          <Text style={styles.title}>외부 사이트로 이동합니다</Text>
          <Text style={styles.body}>
            앱 밖의 웹 페이지로 이동해요. 계속할까요?
          </Text>
          <View style={styles.urlBox}>
            <Text style={styles.urlText} numberOfLines={1}>
              {truncateUrl(url)}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="취소"
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이동하기"
              onPress={() => {
                void go()
              }}
              style={({ pressed }) => [
                styles.goBtn,
                pressed && styles.goPressed,
              ]}
            >
              <Text style={styles.goText}>이동하기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(91, 57, 39, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dismiss: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    ...Shadows.elevation,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
  },
  urlBox: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  goBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  goPressed: {
    opacity: 0.92,
  },
  pressed: {
    opacity: 0.85,
  },
  goText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
