import { View, Text, Pressable, StyleSheet } from 'react-native'
import { PawPrint } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { BottomSheet } from './ui/AppOverlay'

type CoachmarkWelcomeSheetProps = {
  visible: boolean
  petName: string
  onSkip: () => void
  onAccept: () => void
}

/** cm-01-welcome — 펫 홈 첫 진입 투어 안내 */
export function CoachmarkWelcomeSheet({
  visible,
  petName,
  onSkip,
  onAccept,
}: CoachmarkWelcomeSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onSkip}
      onBackdropPress={false}
    >
      <View style={styles.paws} accessibilityElementsHidden>
        <View style={styles.pawBack}>
          <PawPrint size={36} color={Colors.textPrimary} weight="fill" />
        </View>
        <View style={styles.pawFront}>
          <PawPrint size={28} color={Colors.textPrimary} weight="fill" />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={3}>
        {`${petName}와 함께하는 첫걸음,\n같이 둘러볼까요?`}
      </Text>
      <Text style={styles.body}>
        쉽고 빠르게 사용 방법을 안내해 드릴게요.
      </Text>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="건너뛸래요"
          onPress={onSkip}
          style={({ pressed }) => [
            styles.skipBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.skipText}>건너뛸래요</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="좋아요"
          onPress={onAccept}
          style={({ pressed }) => [
            styles.okBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.okText}>좋아요</Text>
        </Pressable>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  paws: {
    alignSelf: 'center',
    width: 64,
    height: 52,
    marginBottom: 18,
    marginTop: 4,
  },
  pawBack: {
    position: 'absolute',
    left: 4,
    top: 0,
    opacity: 0.9,
  },
  pawFront: {
    position: 'absolute',
    right: 2,
    bottom: 0,
    opacity: 0.75,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  skipBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  okBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  pressed: {
    opacity: 0.88,
  },
})
