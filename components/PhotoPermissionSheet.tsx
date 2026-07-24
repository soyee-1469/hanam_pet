import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Images } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { BottomSheet } from './ui/AppOverlay'
import { PrimaryButton } from './ui'
import { getOnboardingCopy } from '../lib/onboarding'

type PhotoPermissionSheetProps = {
  visible: boolean
  onAllow: () => void
  onOtherWay: () => void
}

/**
 * 기록 가져오기 번호 — 사진첩 저장 전 권한 안내 바텀시트
 */
export function PhotoPermissionSheet({
  visible,
  onAllow,
  onOtherWay,
}: PhotoPermissionSheetProps) {
  const sheet = getOnboardingCopy().restoreCode

  return (
    <BottomSheet visible={visible} onRequestClose={onOtherWay}>
      <View style={styles.iconWrap}>
        <Images size={34} color={Colors.selected} weight="fill" />
      </View>
      <Text style={styles.title}>{sheet.sheetTitle}</Text>
      <Text style={styles.body}>{sheet.sheetBody}</Text>
      <PrimaryButton label={sheet.sheetPrimary} emphasized onPress={onAllow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sheet.sheetAlt}
        onPress={onOtherWay}
        style={({ pressed }) => [styles.altBtn, pressed && styles.pressed]}
      >
        <Text style={styles.altText}>{sheet.sheetAlt}</Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  altBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  altText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.75,
  },
})
