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
import { ArrowsInSimple, ArrowsOutSimple, CaretDown, CaretUp } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'

type ExpandableBubbleTextProps = {
  text: string
  textStyle?: StyleProp<TextStyle>
  /** 접힌 상태 최대 줄 수 */
  collapsedLines?: number
  /** 펼친 상태 최대 높이 — 넘치면 내부 스크롤 */
  maxExpandedHeight?: number
  align?: 'left' | 'center' | 'right'
  /**
   * below — 텍스트 아래 화살표 (기본)
   * trailing — 텍스트 우측 확대/접기 아이콘 (질문 말풍선)
   */
  expandPlacement?: 'below' | 'trailing'
  style?: StyleProp<ViewStyle>
}

/**
 * 긴 말풍선 — 접기/펼치기. 다른 페이지로 이동하지 않음.
 */
export function ExpandableBubbleText({
  text,
  textStyle,
  collapsedLines = 2,
  maxExpandedHeight = 160,
  align = 'left',
  expandPlacement = 'below',
  style,
}: ExpandableBubbleTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [needsExpand, setNeedsExpand] = useState(false)
  const [measureWidth, setMeasureWidth] = useState(0)

  useEffect(() => {
    setExpanded(false)
    setNeedsExpand(false)
  }, [text])

  const trailing = expandPlacement === 'trailing'
  const showFull = expanded || !needsExpand

  const body = (
    <Text
      style={textStyle}
      numberOfLines={showFull ? undefined : collapsedLines}
    >
      {text}
    </Text>
  )

  const expandControl = needsExpand ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expanded ? '접기' : '더보기'}
      hitSlop={8}
      onPress={() => setExpanded((v) => !v)}
      style={({ pressed }) => [
        trailing ? styles.expandTrailing : styles.expandBelow,
        pressed && styles.expandPressed,
      ]}
    >
      {trailing ? (
        expanded ? (
          <ArrowsInSimple size={18} color={Colors.cocoa} weight="bold" />
        ) : (
          <ArrowsOutSimple size={18} color={Colors.cocoa} weight="bold" />
        )
      ) : expanded ? (
        <CaretUp size={16} color={Colors.cocoa} weight="bold" />
      ) : (
        <CaretDown size={16} color={Colors.cocoa} weight="bold" />
      )}
    </Pressable>
  ) : null

  const textBlock =
    expanded && needsExpand ? (
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
          style={[
            textStyle,
            styles.measure,
            {
              width: trailing
                ? Math.max(0, measureWidth - 28)
                : measureWidth,
            },
          ]}
          onTextLayout={(e) => {
            setNeedsExpand(e.nativeEvent.lines.length > collapsedLines)
          }}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {text}
        </Text>
      ) : null}

      {trailing ? (
        <View style={styles.trailingRow}>
          <View style={styles.trailingText}>{textBlock}</View>
          {expandControl}
        </View>
      ) : (
        <>
          {textBlock}
          {expandControl}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  measure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
  },
  trailingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  trailingText: {
    flex: 1,
    minWidth: 0,
  },
  expandBelow: {
    marginTop: 6,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  expandTrailing: {
    width: 28,
    height: 28,
    marginBottom: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expandPressed: {
    opacity: 0.7,
  },
})
