import { SvgXml } from 'react-native-svg'
import { MOOD_EMOJI_XML } from '../constants/moodEmojiXml'

type MoodEmojiProps = {
  /** 1~5 — 감정 순서 (최고야→힘들어) */
  index: 1 | 2 | 3 | 4 | 5
  size?: number
}

export function MoodEmoji({ index, size = 40 }: MoodEmojiProps) {
  return (
    <SvgXml
      xml={MOOD_EMOJI_XML[index - 1]}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}
