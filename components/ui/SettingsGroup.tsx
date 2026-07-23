import type { ReactNode } from 'react'
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors } from '../../constants/Colors'
import { TypeStyle } from '../../constants/Typography'
import { SurfaceCard } from './SurfaceCard'

type SettingsGroupProps = {
  /** 섹션 라벨 (예: 내 정보). 없으면 카드만 */
  title?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * 설정 그룹 — SectionLabel + SurfaceCard(SettingsRow 스택).
 * 피그마: SettingsGroupCard
 */
export function SettingsGroup({ title, children, style }: SettingsGroupProps) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <SurfaceCard>{children}</SurfaceCard>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    marginLeft: 4,
    ...TypeStyle.sectionTitle,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
})
