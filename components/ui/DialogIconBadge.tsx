import { View, StyleSheet } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import {
  Info,
  Trash,
  UserMinus,
  WarningCircle,
} from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

/** 확인·안내 팝업 공통 톤 — 원형 뱃지 + 아이콘 */
export type DialogIconTone = 'danger' | 'warning' | 'info' | 'withdraw'

const TONE_STYLE: Record<
  DialogIconTone,
  { Icon: Icon; color: string; bg: string }
> = {
  /** 삭제·지움 */
  danger: {
    Icon: Trash,
    color: Colors.error,
    bg: Colors.errorSoft,
  },
  /** 이탈·미저장 등 주의 */
  warning: {
    Icon: WarningCircle,
    color: Colors.selected,
    bg: Colors.accentSoft,
  },
  /** 안내·정보 */
  info: {
    Icon: Info,
    color: Colors.selected,
    bg: Colors.creamyBeige,
  },
  /** 회원 탈퇴 */
  withdraw: {
    Icon: UserMinus,
    color: Colors.error,
    bg: Colors.errorSoft,
  },
}

type DialogIconBadgeProps = {
  tone?: DialogIconTone
  /** 톤 기본 아이콘 대신 사용 */
  Icon?: Icon
  size?: number
}

/**
 * 탈퇴/삭제/경고/정보 팝업 공통 — 연한 원형 면 + 중앙 아이콘
 */
export function DialogIconBadge({
  tone = 'danger',
  Icon,
  size = 28,
}: DialogIconBadgeProps) {
  const preset = TONE_STYLE[tone]
  const Glyph = Icon ?? preset.Icon

  return (
    <View style={[styles.wrap, { backgroundColor: preset.bg }]}>
      <Glyph size={size} color={preset.color} weight="regular" />
    </View>
  )
}

export function dialogIconPreset(tone: DialogIconTone) {
  return TONE_STYLE[tone]
}

const styles = StyleSheet.create({
  wrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
})
