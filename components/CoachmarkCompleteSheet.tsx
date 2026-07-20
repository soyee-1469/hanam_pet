import { Image, View, Text, Pressable, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'
import { TypeStyle } from '../constants/Typography'
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
      <View style={styles.iconWrap} accessibilityElementsHidden>
        <Image
          source={require('../assets/images/fireworks.png')}
          style={styles.icon}
          resizeMode="contain"
          importantForAccessibility="no"
        />
      </View>
      <Text style={styles.title}>이제 준비가 끝났어요!</Text>
      <Text style={styles.body} numberOfLines={3}>
        {`${petName}가 기다리고 있어요.\n배운 대로 편하게 시작해 보세요.`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${petName} 만나러 가기`}
        onPress={onMeet}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText} numberOfLines={1}>
          {`${petName} 만나러 가기`}
        </Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  // fireworks.png is 814×940 — square cover crops confetti; keep aspect + padding
  iconWrap: {
    alignSelf: 'center',
    width: 80,
    height: 92,
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 4,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...TypeStyle.modalTitle,
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
    paddingHorizontal: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
    maxWidth: '100%',
  },
  pressed: {
    opacity: 0.88,
  },
})
