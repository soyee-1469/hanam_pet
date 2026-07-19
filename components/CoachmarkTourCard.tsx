import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Fonts } from '../constants/Typography'
import { PET_TOUR_TOTAL, type PetTourStep } from '../lib/coachmarkTour'

type CoachmarkTourCardProps = {
  step: PetTourStep
  stepIndex: number
  petName: string
  onNext: () => void
  /** 카드 세로 위치 (하단 기준) */
  bottom: number
}

/** cm-02+ — 중앙 카드형 코치마크 */
export function CoachmarkTourCard({
  step,
  stepIndex,
  petName,
  onNext,
  bottom,
}: CoachmarkTourCardProps) {
  const page = stepIndex + 1
  const tailUp = step.tail === 'up'

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      {tailUp ? <View style={[styles.tail, styles.tailUp]} /> : null}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{step.badge}</Text>
          </View>
          <Text style={styles.page}>
            {page} / {PET_TOUR_TOTAL}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {step.title(petName)}
        </Text>
        <Text style={styles.body} numberOfLines={4}>
          {step.body(petName)}
        </Text>

        <View style={styles.footer}>
          <View style={styles.dots} accessibilityRole="progressbar">
            {Array.from({ length: PET_TOUR_TOTAL }, (_, i) => (
              <View
                key={i}
                style={[i === stepIndex ? styles.dotOn : styles.dotOff]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음"
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.nextText}>다음</Text>
          </Pressable>
        </View>
      </View>
      {!tailUp ? <View style={styles.tail} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 40,
    elevation: 40,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    ...Shadows.elevation,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FDE6DE',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.uiBold,
    color: Colors.primary,
  },
  page: {
    fontSize: 13,
    fontFamily: Fonts.uiSemiBold,
    color: Colors.textDisabled,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotOn: {
    width: 22,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  dotOff: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.creamyBeige,
  },
  nextBtn: {
    minWidth: 88,
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 15,
    fontFamily: Fonts.uiBold,
    color: Colors.surface,
  },
  pressed: {
    opacity: 0.88,
  },
  tail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.surface,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
    ...Shadows.elevation,
  },
  tailUp: {
    marginTop: 0,
    marginBottom: -7,
    zIndex: 1,
  },
})
