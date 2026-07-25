import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { CaretDown, CaretUp } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'

type ExpandableBubbleTextProps = {
  text: string
  textStyle?: StyleProp<TextStyle>
  /** 접힌 상태 최대 줄 수 */
  collapsedLines?: number
  /** 펼친 상태 최대 높이 — 넘치면 내부 스크롤 */
  maxExpandedHeight?: number
  align?: 'left' | 'center' | 'right'
  style?: StyleProp<ViewStyle>
}

/**
 * 2줄 초과 말풍선 — 더보기(화살표)로 같은 자리에서 펼침/접기.
 * 다른 페이지로 이동하지 않음.
 */
export function ExpandableBubbleText({
  text,
  textStyle,
  collapsedLines = 2,
  maxExpandedHeight = 160,
  align = 'left',
  style,
}: ExpandableBubbleTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [needsExpand, setNeedsExpand] = useState(false)
  const [measureWidth, setMeasureWidth] = useState(0)

  useEffect(() => {
    setExpanded(false)
    setNeedsExpand(false)
  }, [text])

  const justify =
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'flex-end'
        : 'flex-start'

  const body = (
    <Text
      style={textStyle}
      numberOfLines={expanded || !needsExpand ? undefined : collapsedLines}
    >
      {text}
    </Text>
  )

  return (
    <View
      style={style}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width)
        if (w > 0 && w !== measureWidth) setMeasureWidth(w)
      }}
    >
      {measureWidth > 0 ? (
        <Text
          style={[textStyle, styles.measure, { width: measureWidth }]}
          onTextLayout={(e) => {
            const lines = e.nativeEvent.lines.length
            setNeedsExpand(lines > collapsedLines)
          }}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {text}
        </Text>
      ) : null}

      {expanded && needsExpand ? (
        <ScrollView
          style={{ maxHeight: maxExpandedHeight }}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}

      {needsExpand ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? '접기' : '더보기'}
          hitSlop={8}
          onPress={() => setExpanded((v) => !v)}
          style={({ pressed }) => [
            styles.expandBtn,
            {
              alignSelf:
                justify === 'center'
                  ? 'center'
                  : justify === 'flex-end'
                    ? 'flex-end'
                    : 'flex-start',
            },
            pressed && styles.expandPressed,
          ]}
        >
          {expanded ? (
            <CaretUp size={16} color={Colors.cocoa} weight="bold" />
          ) : (
            <CaretDown size={16} color={Colors.cocoa} weight="bold" />
          )}
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  measure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
  },
  expandBtn: {
    marginTop: 6,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandPressed: {
    opacity: 0.7,
  },
})
