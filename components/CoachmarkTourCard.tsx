import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Layout } from '../constants/Layout'
import { Colors, Shadows } from '../constants/Colors'
import { PET_TOUR_TOTAL, type PetTourStep } from '../lib/coachmarkTour'

type CoachmarkTourCardProps = {
  step: PetTourStep
  stepIndex: number
  petName: string
  onNext: () => void
  /** 카드 세로 위치 (하단 기준) — top / center와 택일 */
  bottom?: number
  /** 카드 세로 위치 (상단 기준) */
  top?: number
  /** 화면 세로 중앙 */
  center?: boolean
  /** 꼬리 가로 정렬 (상단 메뉴 등 왼쪽 타깃용) */
  tailAlign?: 'center' | 'start'
}

/** cm-02+ — 중앙 카드형 코치마크 */
export function CoachmarkTourCard({
  step,
  stepIndex,
  petName,
  onNext,
  bottom,
  top,
  center = false,
  tailAlign = 'center',
}: CoachmarkTourCardProps) {
  const page = stepIndex + 1
  const tailMode = step.tail ?? 'down'
  const showTail = tailMode !== 'none'
  const tailUp = tailMode === 'up'
  const ctaLabel = step.ctaLabel ?? '다음'
  const tailStyle = [
    styles.tail,
    tailUp && styles.tailUp,
    tailAlign === 'start' && styles.tailStart,
  ]

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        center && styles.wrapCenter,
        !center && (top != null ? { top } : { bottom: bottom ?? 0 }),
      ]}
    >
      {showTail && tailUp ? <View style={tailStyle} /> : null}
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
            accessibilityLabel={ctaLabel}
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.nextText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
      {showTail && !tailUp ? <View style={tailStyle} /> : null}
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
  wrapCenter: {
    top: '28%',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: Layout.blockGap,
    paddingBottom: Layout.blockGap,
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
    fontWeight: '700',
    color: Colors.primary,
  },
  page: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingHorizontal: Layout.screenPaddingH,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
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
  tailStart: {
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
})
