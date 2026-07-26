import { useEffect, useMemo, useState } from 'react'
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
   * below — 텍스트 아래 「더보기/접기」(기본)
   * trailing — 텍스트 우측 「더보기/접기」
   */
  expandPlacement?: 'below' | 'trailing'
  style?: StyleProp<ViewStyle>
}

function readFontSize(textStyle?: StyleProp<TextStyle>, fallback = 15): number {
  const flat = StyleSheet.flatten(textStyle) as TextStyle | undefined
  return typeof flat?.fontSize === 'number' ? flat.fontSize : fallback
}

/** 줄바꿈 + 폭 기준 예상 줄 수 (웹 onTextLayout 없이도 동작) */
function estimateLineCount(
  text: string,
  width: number,
  fontSize: number,
): number {
  const parts = text.replace(/\r\n/g, '\n').split('\n')
  if (width <= 0) return parts.length

  let total = 0
  for (const part of parts) {
    if (part.length === 0) {
      total += 1
      continue
    }
    let used = 0
    let lines = 1
    for (const ch of part) {
      // 한글·이모지 등 전각 ≈ fontSize, 영문/숫자 ≈ 0.55em
      const code = ch.codePointAt(0) ?? 0
      const w =
        code > 0xff || (code >= 0x1100 && code <= 0x11ff) ? fontSize : fontSize * 0.55
      if (used + w > width && used > 0) {
        lines += 1
        used = w
      } else {
        used += w
      }
    }
    total += lines
  }
  return total
}

/**
 * 긴 말풍선 — 2줄 넘으면 「더보기/접기」.
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
  const [measureWidth, setMeasureWidth] = useState(0)

  const fontSize = readFontSize(textStyle)

  const hardLines = useMemo(
    () => text.replace(/\r\n/g, '\n').split('\n').length,
    [text],
  )

  const estimatedLines = useMemo(
    () => estimateLineCount(text, measureWidth, fontSize),
    [text, measureWidth, fontSize],
  )

  // 줄바꿈만으로도 바로 판별 + 폭 측정 후 줄바꿈 없는 긴 문장도 판별
  const needsExpand =
    hardLines > collapsedLines || estimatedLines > collapsedLines

  useEffect(() => {
    setExpanded(false)
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
