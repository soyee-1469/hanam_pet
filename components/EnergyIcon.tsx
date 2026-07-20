import { Image, type ImageStyle, type StyleProp } from 'react-native'

const ENERGY_ICON = require('../assets/images/아이콘/에너지.png')
const ENERGY_EMPTY_ICON = require('../assets/images/아이콘/에너지없음.png')

type Props = {
  size?: number
  empty?: boolean
  style?: StyleProp<ImageStyle>
}

/** 에너지 번개 에셋 — Phosphor Lightning 대신 사용 */
export function EnergyIcon({ size = 20, empty = false, style }: Props) {
  return (
    <Image
      source={empty ? ENERGY_EMPTY_ICON : ENERGY_ICON}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  )
}
