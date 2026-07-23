import { View, Text, Image, StyleSheet } from 'react-native'
import { PawPrint } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { CenterDialog } from './ui/AppOverlay'
import { PrimaryButton } from './ui/Button'
import { ATTENDANCE_ENERGY_REWARD } from '../lib/attendance'

type AttendanceDoneDialogProps = {
  visible: boolean
  /** 이번에 새로 적립된 에너지. 이미 출석했으면 0 */
  credited: number
  /** 이미 오늘 출석한 상태 */
  alreadyStamped?: boolean
  onClose: () => void
}

/**
 * 출석 메뉴 진입 시 홈 위 출석 완료 팝업.
 * 카피·CTA는 시안 고정, 에너지 수치는 보상 상수 반영.
 */
export function AttendanceDoneDialog({
  visible,
  credited,
  alreadyStamped = false,
  onClose,
}: AttendanceDoneDialogProps) {
  const energyShown =
    credited > 0 ? credited : ATTENDANCE_ENERGY_REWARD
  const body = alreadyStamped
    ? '오늘은 이미 출석했어요. 내일 또 만나요!'
    : `출석 보상으로 에너지 ${energyShown}개를 얻었어요!`

  return (
    <CenterDialog
      visible={visible}
      onRequestClose={onClose}
      onBackdropPress={onClose}
      cardStyle={styles.card}
    >
      <View style={styles.art} accessibilityElementsHidden>
        <Image
          source={require('../assets/images/아이콘/출석도장.png')}
          style={styles.stampIcon}
          resizeMode="contain"
        />
        <View style={styles.seal}>
          <PawPrint size={36} color={Colors.selected} weight="fill" />
          <Text style={styles.sealText}>출석완료</Text>
        </View>
      </View>

      <Text style={styles.title}>출석 완료!</Text>
      <Text style={styles.body}>{body}</Text>

      <PrimaryButton
        label="내일도 잊지 말고 출석해요"
        emphasized
        onPress={onClose}
      />
    </CenterDialog>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: Layout.screenPaddingH,
    gap: 14,
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    minHeight: 120,
  },
  stampIcon: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  seal: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.selected,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...Shadows.elevation,
  },
  sealText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.selected,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 6,
  },
})
