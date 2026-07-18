import { SvgXml } from 'react-native-svg'
import { MOOD_EMOJI_XML } from '../constants/moodEmojiXml'

type MoodEmojiProps = {
  /** 1~5 — 기뻐요·슬퍼요·화가나요·걱정돼요·불편해요 */
  index: 1 | 2 | 3 | 4 | 5
  size?: number
}

/** Illustrator data-name만 제거 (clip-path용 id는 유지) */
function sanitizeSvgXml(xml: string) {
  return xml.replace(/\sdata-name="[^"]*"/gi, '')
}

export function MoodEmoji({ index, size = 40 }: MoodEmojiProps) {
  return (
    <SvgXml
      xml={sanitizeSvgXml(MOOD_EMOJI_XML[index - 1])}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}
