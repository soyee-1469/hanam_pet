import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Layout } from '../constants/Layout'
import { Colors } from '../constants/Colors'
import { PET_TOUR_TOTAL, type PetTourStep } from '../lib/coachmarkTour'

type CoachmarkTourCardProps = {
  step: PetTourStep
  stepIndex: number
  petName: string
  onNext: () => void
  bottom?: number
  top?: number
  center?: boolean
  tailAlign?: 'center' | 'start'
}

/**
 * 6단계 투어 카드
 * — 흰 면 + 코랄은「다음」만 / 테두리·이중 꼬리 없음
 */
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

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        center && styles.wrapCenter,
        !center && (top != null ? { top } : { bottom: bottom ?? 0 }),
      ]}
    >
      <View style={styles.unit}>
        {showTail && tailUp ? (
          <View
            style={[
              styles.tailSlot,
              styles.tailSlotUp,
              tailAlign === 'start' && styles.tailSlotStart,
            ]}
          >
            <View style={[styles.tail, styles.tailUp]} />
          </View>
        ) : null}

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

        {showTail && !tailUp ? (
          <View
            style={[
              styles.tailSlot,
              styles.tailSlotDown,
              tailAlign === 'start' && styles.tailSlotStart,
            ]}
          >
            <View style={styles.tail} />
          </View>
        ) : null}
      </View>
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
  unit: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.peach,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cocoa,
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
  tailSlot: {
    width: '100%',
    height: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tailSlotUp: {
    marginBottom: -1,
  },
  tailSlotDown: {
    marginTop: -1,
  },
  tailSlotStart: {
    alignItems: 'flex-start',
    paddingLeft: 40,
  },
  /** 순수 흰 다이아 — 테두리 없음(코랄/베이지 라인 오인 방지) */
  tail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
  tailUp: {
    marginTop: 0,
    marginBottom: -2,
  },
})
