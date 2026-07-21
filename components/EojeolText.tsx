import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native'
import { eojeolWrap } from '../lib/eojeolText'

type Props = Omit<TextProps, 'children'> & {
  children: string
}

/** 어절 단위로만 줄바꿈되는 Text (한글 음절 중간 개행 방지) */
export function EojeolText({ children, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        style as StyleProp<TextStyle>,
        {
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        } as TextStyle,
      ]}
    >
      {eojeolWrap(children)}
    </Text>
  )
}
