import { Text, Pressable, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'

type DangerTextLinkProps = {
  label: string
  onPress: () => void
  /** 기본은 secondary — 파괴 강조가 필요할 때만 danger */
  tone?: 'secondary' | 'danger'
  accessibilityLabel?: string
}

/** 설정 하단 「회원탈퇴」 등 ghost 텍스트 링크 */
export function DangerTextLink({
  label,
  onPress,
  tone = 'secondary',
  accessibilityLabel,
}: DangerTextLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text
        style={[styles.text, tone === 'danger' && styles.textDanger]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: Layout.headerPaddingH,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  textDanger: {
    color: Colors.error,
  },
})
