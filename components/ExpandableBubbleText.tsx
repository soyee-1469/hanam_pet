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
  type LayoutChangeEvent,
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
   * below — 텍스트 아래 「더보기/접기」(기본)
   * trailing — 텍스트 우측 「더보기/접기」
   */
  expandPlacement?: 'below' | 'trailing'
  style?: StyleProp<ViewStyle>
}

/**
 * 긴 말풍선 — 접힌 줄 수를 넘으면 작은 「더보기/접기」로 펼친다.
 * (웹에서도 동작하도록 높이 비교로 overflow 감지)
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
  const [fullH, setFullH] = useState(0)
  const [collapsedH, setCollapsedH] = useState(0)

  useEffect(() => {
    setExpanded(false)
    setNeedsExpand(false)
    setFullH(0)
    setCollapsedH(0)
  }, [text])

  useEffect(() => {
    if (fullH <= 0 || collapsedH <= 0) return
    setNeedsExpand(fullH > collapsedH + 2)
  }, [fullH, collapsedH])

  const trailing = expandPlacement === 'trailing'
  const showFull = expanded || !needsExpand

  const onFullLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height)
    if (h > 0 && h !== fullH) setFullH(h)
  }

  const onCollapsedLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height)
    if (h > 0 && h !== collapsedH) setCollapsedH(h)
  }

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
      hitSlop={10}
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
      {/* 높이 측정용 — 웹에서도 줄 수 판별 */}
      {measureWidth > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.measureBox, { width: measureWidth }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View onLayout={onFullLayout}>
            <Text style={textStyle}>{text}</Text>
          </View>
          <View onLayout={onCollapsedLayout}>
            <Text style={textStyle} numberOfLines={collapsedLines}>
              {text}
            </Text>
          </View>
        </View>
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
  measureBox: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    left: 0,
    top: 0,
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
    fontSize: Type.captionSm,
    lineHeight: 16,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  expandPressed: {
    opacity: 0.65,
  },
})
