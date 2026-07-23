import { View, StyleSheet } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { MOOD_EMOJI_XML } from '../constants/moodEmojiXml'

type MoodEmojiProps = {
  /** 1~5 — 기뻐요·슬퍼요·화가나요·걱정돼요·불편해요 */
  index: 1 | 2 | 3 | 4 | 5
  size?: number
  /** 머리 위 감정색 점 */
  colorDot?: string
  /** 점 크기 (기본: 이모지 크기에 비례) */
  dotSize?: number
}

/** Illustrator data-name만 제거 (clip-path용 id는 유지) */
function sanitizeSvgXml(xml: string) {
  return xml.replace(/\sdata-name="[^"]*"/gi, '')
}

export function MoodEmoji({
  index,
  size = 40,
  colorDot,
  dotSize,
}: MoodEmojiProps) {
  const emoji = (
    <SvgXml
      xml={sanitizeSvgXml(MOOD_EMOJI_XML[index - 1])}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  )

  if (!colorDot) return emoji

  const d = dotSize ?? Math.max(4, Math.round(size * 0.22))
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.dot,
          {
            width: d,
            height: d,
            borderRadius: d / 2,
            backgroundColor: colorDot,
          },
        ]}
      />
      {emoji}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    flexShrink: 0,
  },
})
