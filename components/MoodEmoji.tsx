import { SvgXml } from 'react-native-svg'
import { MOOD_EMOJI_XML } from '../constants/moodEmojiXml'

type MoodEmojiProps = {
  /** 1~5 — 감정 순서 (최고야→힘들어) */
  index: 1 | 2 | 3 | 4 | 5
  size?: number
}

/** 웹 DOM에 dataName 등으로 새어 나가는 Illustrator 메타 속성 제거 */
function sanitizeSvgXml(xml: string) {
  return xml
    .replace(/\sdata-name="[^"]*"/gi, '')
    .replace(/\sid="[^"]*"/gi, '')
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
