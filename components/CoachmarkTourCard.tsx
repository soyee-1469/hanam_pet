import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Layout } from '../constants/Layout'
import { Colors } from '../constants/Colors'
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

/** 6단계 투어 카드 — 옅은 면 + 꼬리만, 장식 최소화 */
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
          <Text style={styles.badgeText}>{step.badge}</Text>
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
    top: '30%',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  page: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dotOn: {
    width: 16,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.cocoa,
  },
  dotOff: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.sand,
  },
  nextBtn: {
    minWidth: 80,
    height: 38,
    paddingHorizontal: 16,
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
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
  },
  tailUp: {
    marginTop: 0,
    marginBottom: -6,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    zIndex: 1,
  },
  tailStart: {
    alignSelf: 'flex-start',
    marginLeft: 40,
  },
})
