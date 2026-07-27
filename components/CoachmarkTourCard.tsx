import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useDesignWindow } from '../lib/designWindow'
import { Colors } from '../constants/Colors'
import { tabBarReserveHeight } from '../constants/Layout'
import { PET_TOUR_TOTAL, type PetTourStep } from '../lib/coachmarkTour'

type CoachmarkTourCardProps = {
  step: PetTourStep
  stepIndex: number
  petName: string
  onNext: () => void
  /** 화살표 — 구멍 근처 */
  bottom?: number
  top?: number
  center?: boolean
  tailAlign?: 'center' | 'start'
  /** 안내·CTA 고정 하단 여백 (기본: 화면 중하단) */
  ctaBottom?: number
}

/**
 * 투어 안내
 * — 문구·점·「다음」은 같은 자리에 고정
 * — 화살표만 구멍을 가리킴 (버튼이 화살표·구멍 사이에 끼지 않음)
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
  ctaBottom,
}: CoachmarkTourCardProps) {
  const insets = useSafeAreaInsets()
  const { height: winH } = useDesignWindow()
  const tabReserve = tabBarReserveHeight(insets.bottom)

  // 단계마다 동일한 손·눈 위치 (탭바·네비 구멍 위)
  const panelBottom =
    ctaBottom ?? Math.max(tabReserve + 210, Math.round(winH * 0.36))

  const page = stepIndex + 1
  const tailMode = step.tail ?? 'down'
  const showArrow = tailMode !== 'none'
  const arrowUp = tailMode === 'up'
  const ctaLabel = step.ctaLabel ?? '다음'
  const alignStart = tailAlign === 'start'

  // 화살표만 구멍 쪽에 — down은 bottom, up은 top
  const arrowStyle = (() => {
    if (!showArrow) return null
    if (arrowUp) {
      if (top != null) return { top }
      if (center) return { top: '18%' as const }
      return { top: Math.max(24, Math.round(winH * 0.2)) }
    }
    // down — 구멍 바로 위
    if (bottom != null) return { bottom: Math.max(tabReserve + 4, bottom) }
    if (center) return { bottom: tabReserve + 12 }
    return { bottom: tabReserve + 96 }
  })()

  return (
    <>
      {showArrow && arrowStyle ? (
        <View
          pointerEvents="none"
          style={[
            styles.arrowWrap,
            arrowStyle,
            alignStart && styles.arrowWrapStart,
          ]}
          accessibilityElementsHidden
        >
          <DashedArrow up={arrowUp} />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.panel, { bottom: panelBottom }]}
      >
        <View
          style={[styles.unit, alignStart && styles.unitStart]}
          pointerEvents="box-none"
        >
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
        </View>
      </View>
    </>
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
  panel: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 45,
    elevation: 45,
    alignItems: 'center',
  },
  arrowWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 40,
    alignItems: 'center',
    height: 36,
  },
  arrowWrapStart: {
    alignItems: 'flex-start',
    paddingLeft: 56,
  },
  unit: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  unitStart: {
    alignItems: 'flex-start',
  },
  copy: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 14,
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
  arrowFlip: {
    transform: [{ rotate: '180deg' }],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
