import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'
import { Image as ImageIcon } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { PrimaryButton } from './ui'

type PhotoPermissionSheetProps = {
  visible: boolean
  onAllow: () => void
  onOtherWay: () => void
}

/** 시스템 권한 요청 전 — 사진첩 저장 안내 바텀시트 */
export function PhotoPermissionSheet({
  visible,
  onAllow,
  onOtherWay,
}: PhotoPermissionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onOtherWay}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onOtherWay} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <ImageIcon size={36} color={Colors.primary} weight="fill" />
          </View>
          <Text style={styles.title}>사진 및 사진첩 접근 권한</Text>
          <Text style={styles.body}>
            사진첩에 번호를 저장하기 위해 권한이 필요해요. 다음 화면에서
            ‘허용’을 눌러 주세요.
          </Text>
          <PrimaryButton label="알겠어요" onPress={onAllow} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다른 방법으로 저장할게요"
            onPress={onOtherWay}
            style={({ pressed }) => [
              styles.altBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.altText}>다른 방법으로 저장할게요</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(94, 64, 51, 0.45)',
  },
  dismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    ...Shadows.elevation,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.sand,
    marginBottom: 18,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Colors.iconFeed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  altBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  altText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  pressed: {
    opacity: 0.75,
  },
})
