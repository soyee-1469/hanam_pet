import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Heart } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

type ProgressDotsProps = {
  total: number
  index: number
  /** 커스텀 감성 문구 — 있으면 숫자 아래 두 번째 줄로 표시 */
  label?: string
  showLabel?: boolean
  placement?: 'footer' | 'header'
  /**
   * true면 현재 step의 마지막 하트(방금 채워질 칸)에 팝 애니메이션.
   * 저장 CTA 직후 성취감 피드백용.
   */
  popLast?: boolean
  onPopComplete?: () => void
}

/** Phosphor Heart progress — 숫자·감성 문구 위, 하트 아래 */
export function ProgressDots({
  total,
  index,
  label,
  showLabel = true,
  placement = 'footer',
  popLast = false,
  onPopComplete,
}: ProgressDotsProps) {
  const step = Math.min(total, Math.max(1, index + 1))
  const fraction = `${step} / ${total}`
  const mood = label ?? nudgeMood(step, total)
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
        <View style={styles.labelBlock}>
          <Text style={styles.fraction}>{fraction}</Text>
          <Text style={styles.mood}>{mood}</Text>
        </View>
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

function nudgeMood(step: number, total: number) {
  if (step >= total) return '준비가 끝났어요!'
  if (step === total - 1) return '거의 다 왔어요!'
  if (step >= Math.ceil(total / 2)) return '절반을 넘었어요!'
  if (step === 1) return '차근차근 시작해요'
  return '잘하고 있어요'
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
  labelBlock: {
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  fraction: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  mood: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
})
