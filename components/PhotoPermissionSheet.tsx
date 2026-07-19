import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Copy } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Fonts } from '../constants/Typography'
import { BottomSheet } from './ui/AppOverlay'
import { PrimaryButton } from './ui'
import { getOnboardingCopy } from '../lib/onboarding'

type PhotoPermissionSheetProps = {
  visible: boolean
  onAllow: () => void
  onOtherWay: () => void
}

/**
 * 기록 가져오기 번호 보관 안내 바텀시트
 * (실제 동작은 클립보드 복사 + 스크린샷 유도 — 사진첩 저장 아님)
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
        <Copy size={36} color={Colors.selected} weight="fill" />
      </View>
      <Text style={styles.title}>{sheet.sheetTitle}</Text>
      <Text style={styles.body}>{sheet.sheetBody}</Text>
      <PrimaryButton label={sheet.sheetPrimary} onPress={onAllow} />
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
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
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
    fontFamily: Fonts.uiSemiBold,
    color: Colors.textDisabled,
  },
  pressed: {
    opacity: 0.75,
  },
})
