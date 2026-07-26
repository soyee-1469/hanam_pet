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
import { Colors } from '../constants/Colors'
import { Type } from '../constants/Typography'

type ExpandableBubbleTextProps = {
  text: string
  textStyle?: StyleProp<TextStyle>
  /** 접힌 상태 최대 줄 수 */
  collapsedLines?: number
  /** 펼친 상태 최대 높이 — 말풍선 대역을 넘기면 내부 스크롤 */
  maxExpandedHeight?: number
  align?: 'left' | 'center' | 'right'
  /**
   * below — 텍스트 아래 「더보기/접기」(기본, 답변)
   * trailing — 텍스트 우측 「더보기/접기」(질문)
   */
  expandPlacement?: 'below' | 'trailing'
  style?: StyleProp<ViewStyle>
}

/** trailing 라벨 폭 여유 (측정용) */
const TRAILING_LABEL_RESERVE = 44

/**
 * 긴 말풍선 — 2줄 이상이면 접고, 작은 「더보기/접기」로 펼친다.
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
        align === 'right' && !trailing && styles.expandBelowRight,
        align === 'center' && !trailing && styles.expandBelowCenter,
        pressed && styles.expandPressed,
      ]}
    >
      <Text style={styles.expandLabel}>{expanded ? '접기' : '더보기'}</Text>
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
                ? Math.max(0, measureWidth - TRAILING_LABEL_RESERVE)
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
    marginTop: 4,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  expandBelowRight: {
    alignSelf: 'flex-end',
  },
  expandBelowCenter: {
    alignSelf: 'center',
  },
  expandTrailing: {
    paddingVertical: 2,
    marginBottom: 1,
    flexShrink: 0,
  },
  expandLabel: {
    fontSize: Type.micro,
    lineHeight: 14,
    fontWeight: '600',
    color: Colors.cocoa,
    opacity: 0.72,
  },
  expandPressed: {
    opacity: 0.7,
  },
})
