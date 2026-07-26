import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
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
 * 영역별 설명 콜아웃 (모달 카드 아님)
 * — 딤 위 타이틀·본문 + 화살표, CTA만 코랄
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
  const showArrow = tailMode !== 'none'
  const arrowUp = tailMode === 'up'
  const ctaLabel = step.ctaLabel ?? '다음'
  const alignStart = tailAlign === 'start'

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        center && styles.wrapCenter,
        !center && (top != null ? { top } : { bottom: bottom ?? 0 }),
      ]}
    >
      <View
        style={[styles.unit, alignStart && styles.unitStart]}
        pointerEvents="box-none"
      >
        {showArrow && arrowUp ? (
          <View
            style={[styles.arrowSlot, alignStart && styles.arrowSlotStart]}
            accessibilityElementsHidden
          >
            <DashedArrow up />
          </View>
        ) : null}

        <View style={[styles.copy, alignStart && styles.copyStart]}>
          <Text style={styles.page}>
            {page}/{PET_TOUR_TOTAL}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {step.title(petName)}
          </Text>
          <Text style={styles.body} numberOfLines={3}>
            {step.body(petName)}
          </Text>
        </View>

        <View
          style={[styles.footer, alignStart && styles.footerStart]}
          pointerEvents="box-none"
        >
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

        {showArrow && !arrowUp ? (
          <View
            style={[styles.arrowSlot, alignStart && styles.arrowSlotStart]}
            accessibilityElementsHidden
          >
            <DashedArrow />
          </View>
        ) : null}
      </View>
    </View>
  )
}

function DashedArrow({ up = false }: { up?: boolean }) {
  return (
    <Svg
      width={28}
      height={36}
      viewBox="0 0 28 36"
      style={up ? styles.arrowFlip : undefined}
    >
      <Path
        d="M14 2 V26"
        stroke={Colors.surface}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <Path
        d="M8 20 L14 28 L20 20"
        stroke={Colors.surface}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 40,
    elevation: 40,
  },
  wrapCenter: {
    top: '28%',
  },
  unit: {
    width: '100%',
    alignItems: 'center',
  },
  unitStart: {
    alignItems: 'flex-start',
  },
  copy: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  copyStart: {
    paddingLeft: 8,
  },
  page: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.accent,
    marginBottom: 6,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 21,
  },
  arrowSlot: {
    height: 36,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowSlotStart: {
    alignSelf: 'flex-start',
    paddingLeft: 36,
  },
  arrowFlip: {
    transform: [{ rotate: '180deg' }],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
  },
  footerStart: {
    paddingLeft: 8,
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
    backgroundColor: Colors.accent,
  },
  dotOff: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  nextBtn: {
    minWidth: 88,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 14,
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
})
