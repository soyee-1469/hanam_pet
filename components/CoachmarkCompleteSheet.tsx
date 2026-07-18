import { Text, Pressable, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'
import { BottomSheet } from './ui/AppOverlay'

type CoachmarkCompleteSheetProps = {
  visible: boolean
  petName: string
  onMeet: () => void
}

/** cm-06-complete — 투어 완료 축하 시트 */
export function CoachmarkCompleteSheet({
  visible,
  petName,
  onMeet,
}: CoachmarkCompleteSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onMeet}
      onBackdropPress={false}
    >
      <Text style={styles.emoji} accessibilityElementsHidden>
        🎉
      </Text>
      <Text style={styles.title}>이제 준비가 끝났어요!</Text>
      <Text style={styles.body}>
        {`${petName}가 기다리고 있어요.\n배운 대로 편하게 시작해 보세요.`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${petName} 만나러 가기`}
        onPress={onMeet}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>{`${petName} 만나러 가기`}</Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  emoji: {
    alignSelf: 'center',
    fontSize: 48,
    lineHeight: 56,
    marginTop: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
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
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.surface,
  },
  pressed: {
    opacity: 0.88,
  },
})
