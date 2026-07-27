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
import { useDesignWindow } from '../lib/designWindow'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { Type, TypeStyle } from '../constants/Typography'
import { eojeolTextStyle, eojeolWrap } from '../lib/eojeolText'
import { CenterDialog } from './ui/AppOverlay'

type ExpandableBubbleTextProps = {
  text: string
  textStyle?: StyleProp<TextStyle>
  /** 접힌 상태 최대 줄 수 */
  collapsedLines?: number
  /**
   * @deprecated 팝업 모드에서는 사용하지 않음. 호환용으로만 유지.
   */
  maxExpandedHeight?: number
  align?: 'left' | 'center' | 'right'
  /**
   * below — 텍스트 아래 「더보기」(기본)
   * trailing — 텍스트 우측 「더보기」
   */
  expandPlacement?: 'below' | 'trailing'
  /**
   * popup — 더보기 시 가운데 팝업+스크롤 (대화 무대 기본)
   * inline — 같은 자리에서 펼침 (목록·상세처럼 공간이 넉넉할 때)
   */
  expandMode?: 'popup' | 'inline'
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
 * 긴 말풍선 — collapsedLines 넘으면 「더보기」.
 * 대화 무대는 높이 고정이라 인라인 펼침이 잘라서, 기본은 팝업+스크롤.
 */
export function ExpandableBubbleText({
  text,
  textStyle,
  collapsedLines = 2,
  maxExpandedHeight = 220,
  align = 'left',
  expandPlacement = 'below',
  expandMode = 'popup',
  style,
}: ExpandableBubbleTextProps) {
  const { height: windowH } = useDesignWindow()
  const [expanded, setExpanded] = useState(false)
  const [measureWidth, setMeasureWidth] = useState(0)

  const fontSize = readFontSize(textStyle)
  const popupScrollMaxH = Math.round(windowH * 0.55)

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
  const usePopup = expandMode === 'popup'
  const showInlineFull = !usePopup && (expanded || !needsExpand)

  const collapsedBody = (
    <Text
      style={[eojeolTextStyle, textStyle]}
      numberOfLines={needsExpand ? collapsedLines : undefined}
    >
      {eojeolWrap(text)}
    </Text>
  )

  const inlineExpandedBody = (
    <ScrollView
      style={{ maxHeight: maxExpandedHeight }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={[eojeolTextStyle, textStyle]}>{eojeolWrap(text)}</Text>
    </ScrollView>
  )

  const expandControl = needsExpand ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expanded && !usePopup ? '접기' : '더보기'}
      hitSlop={10}
      onPress={() => setExpanded((v) => (usePopup ? true : !v))}
      style={({ pressed }) => [
        trailing ? styles.expandTrailing : styles.expandBelow,
        align === 'right' && !trailing && styles.expandBelowRight,
        align === 'center' && !trailing && styles.expandBelowCenter,
        pressed && styles.expandPressed,
      ]}
    >
      <Text style={styles.expandLabel}>
        {expanded && !usePopup ? '접기' : '더보기'}
      </Text>
    </Pressable>
  ) : null

  const textBlock =
    !usePopup && showInlineFull && needsExpand
      ? inlineExpandedBody
      : collapsedBody

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

      {usePopup ? (
        <CenterDialog
          visible={expanded && needsExpand}
          onRequestClose={() => setExpanded(false)}
          cardStyle={styles.popupCard}
        >
          <ScrollView
            style={{ maxHeight: popupScrollMaxH }}
            contentContainerStyle={styles.popupScrollContent}
            showsVerticalScrollIndicator
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[eojeolTextStyle, styles.popupText, textStyle]}>
              {eojeolWrap(text)}
            </Text>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="접기"
            onPress={() => setExpanded(false)}
            style={({ pressed }) => [
              styles.popupClose,
              pressed && styles.expandPressed,
            ]}
          >
            <Text style={styles.popupCloseLabel}>접기</Text>
          </Pressable>
        </CenterDialog>
      ) : null}
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
  popupCard: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    paddingTop: Layout.blockGap,
    paddingBottom: Layout.blockGap,
  },
  popupScrollContent: {
    paddingBottom: 4,
  },
  popupText: {
    ...TypeStyle.body,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  popupClose: {
    marginTop: Layout.sectionGap,
    alignSelf: 'center',
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCloseLabel: {
    ...TypeStyle.button,
    color: Colors.cocoa,
  },
})
