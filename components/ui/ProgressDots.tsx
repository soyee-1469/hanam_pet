import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Heart } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

type ProgressDotsProps = {
  total: number
  index: number
  /** false면 숫자(N / total)도 숨기고 하트만 표시 */
  showLabel?: boolean
  placement?: 'footer' | 'header'
  /**
   * true면 현재 step의 마지막 하트(방금 채워질 칸)에 팝 애니메이션.
   * 저장 CTA 직후 성취감 피드백용.
   */
  popLast?: boolean
  onPopComplete?: () => void
}

/** Phosphor Heart progress — 숫자 위, 하트 아래 */
export function ProgressDots({
  total,
  index,
  showLabel = true,
  placement = 'footer',
  popLast = false,
  onPopComplete,
}: ProgressDotsProps) {
  const step = Math.min(total, Math.max(1, index + 1))
  const fraction = `${step} / ${total}`
  const popScale = useRef(new Animated.Value(1)).current
  const popRan = useRef(false)

  useEffect(() => {
    if (!popLast || popRan.current) return
    popRan.current = true
    popScale.setValue(0.55)
    Animated.sequence([
      Animated.spring(popScale, {
        toValue: 1.28,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }),
      Animated.spring(popScale, {
        toValue: 1,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onPopComplete?.()
    })
  }, [popLast, onPopComplete, popScale])

  return (
    <View
      style={[
        styles.wrap,
        placement === 'footer' ? styles.wrapFooter : styles.wrapHeader,
      ]}
    >
      {showLabel ? (
        <Text style={styles.fraction}>{fraction}</Text>
      ) : null}
      <View style={styles.row} accessibilityRole="progressbar">
        {Array.from({ length: total }, (_, i) => {
          const filled = i < step
          const isPopTarget = popLast && i === step - 1
          const heart = (
            <Heart
              size={18}
              color={filled ? Colors.primary : '#E4D8CE'}
              weight={filled ? 'fill' : 'regular'}
              style={styles.heart}
            />
          )
          if (isPopTarget) {
            return (
              <Animated.View
                key={i}
                style={{ transform: [{ scale: popScale }] }}
              >
                {heart}
              </Animated.View>
            )
          }
          return <View key={i}>{heart}</View>
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  wrapFooter: {
    marginBottom: 14,
  },
  wrapHeader: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    marginHorizontal: 5,
  },
  fraction: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
})
