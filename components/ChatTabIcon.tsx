import { SvgXml } from 'react-native-svg'
import { CHAT_ICON_ACTIVE_XML, CHAT_ICON_XML } from '../constants/chatIconXml'
import { Colors } from '../constants/Colors'

type ChatTabIconProps = {
  focused: boolean
  size?: number
  color?: string
}

function tintChatXml(xml: string, color: string) {
  return xml.replace(/fill="#[0-9A-Fa-f]{3,8}"/g, `fill="${color}"`)
}

/** Tab bar chat icon — assets/images/chat_icon(_active).svg via SvgXml (MoodEmoji pattern). */
export function ChatTabIcon({
  focused,
  size = 26,
  color = focused ? Colors.primary : Colors.textDisabled,
}: ChatTabIconProps) {
  const xml = tintChatXml(focused ? CHAT_ICON_ACTIVE_XML : CHAT_ICON_XML, color)
  return (
    <SvgXml
      xml={xml}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}
