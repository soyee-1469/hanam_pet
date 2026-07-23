import type { ReactNode } from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors, Shadows } from '../../constants/Colors'

type SurfaceCardProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/** 흰 서피스 카드 — 설정 그룹·리스트 면의 기본 */
export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
})
