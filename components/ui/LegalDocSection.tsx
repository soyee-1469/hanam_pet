import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'

type LegalDocSectionProps = {
  title: string
  body: string
  /** 다음 섹션이 있으면 divider */
  showDivider?: boolean
}

/** 이용약관·개인정보 등 문서 섹션 — 피그마 LegalDocSection */
export function LegalDocSection({
  title,
  body,
  showDivider = false,
}: LegalDocSectionProps) {
  return (
    <View style={[styles.section, showDivider && styles.sectionDivider]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 18,
  },
  sectionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 23,
  },
})
