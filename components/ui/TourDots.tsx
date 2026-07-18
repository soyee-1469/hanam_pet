import { View, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'

type TourDotsProps = {
  total: number
  index: number
}

/**
 * 서비스 소개 투어 인디케이터 — 바(Bar) 스타일 통일
 * 비활성: 짧은 회색 막대 / 활성: 길고 굵은 오렌지 막대
 */
export function TourDots({ total, index }: TourDotsProps) {
  const active = Math.min(total - 1, Math.max(0, index))

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.bar, i === active ? styles.barOn : styles.barOff]}
        />
      ))}
    </View>
  )
}

/** CTA 푸터 공통 패딩 — 투어·설정 단계 버튼 높이 맞춤 */
export const onboardingFooterStyle = {
  paddingHorizontal: 20,
  paddingBottom: 16,
  paddingTop: 8,
} as const

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    height: 16,
  },
  bar: {
    height: 7,
    borderRadius: 4,
  },
  barOff: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.sand,
  },
  barOn: {
    width: 22,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
})
