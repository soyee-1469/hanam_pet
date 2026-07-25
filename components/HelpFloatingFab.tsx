import { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { HelpContactsSheet } from './HelpContactsSheet'

type HelpFloatingFabProps = {
  visible?: boolean
  /** 입력창·탭바 위로 띄울 하단 inset */
  bottom?: number
  style?: StyleProp<ViewStyle>
}

const COLLAPSED_W = 88
const EXPANDED_W = 252

/**
 * 대화 — 우측 「마음 상담」 플로팅.
 * 1차 탭: 안내 문구로 확장 / 2차 탭: 상담 연락처 시트.
 */
export function HelpFloatingFab({
  visible = true,
  bottom = 120,
  style,
}: HelpFloatingFabProps) {
  const [expanded, setExpanded] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const appearScale = useRef(new Animated.Value(0)).current
  const appearOpacity = useRef(new Animated.Value(0)).current
  const expandProgress = useRef(new Animated.Value(0)).current
  const pressScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!visible) {
      appearScale.setValue(0)
      appearOpacity.setValue(0)
      expandProgress.setValue(0)
      setExpanded(false)
      return
    }
    appearScale.setValue(0.72)
    appearOpacity.setValue(0)
    Animated.parallel([
      Animated.spring(appearScale, {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(appearOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, appearScale, appearOpacity, expandProgress])

  useEffect(() => {
    Animated.spring(expandProgress, {
      toValue: expanded ? 1 : 0,
      friction: 8,
      tension: 110,
      useNativeDriver: false,
    }).start()
  }, [expanded, expandProgress])

  if (!visible) return null

  const bumpPress = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.96,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 5,
        tension: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const onPress = () => {
    bumpPress()
    if (!expanded) {
      setExpanded(true)
      return
    }
    setSheetOpen(true)
  }

  const onCloseSheet = () => {
    setSheetOpen(false)
    setExpanded(false)
  }

  const stickerWidth = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_W, EXPANDED_W],
  })

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            bottom,
            opacity: appearOpacity,
            transform: [{ scale: appearScale }],
          },
          style,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded
                ? '도움 받을 곳을 알려 드릴게요'
                : '마음 상담'
            }
            accessibilityHint={
              expanded
                ? '전문 상담 기관 연락처가 열려요'
                : '안내 문구가 펼쳐져요'
            }
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Animated.View style={[styles.sticker, { width: stickerWidth }]}>
              <View style={styles.phoneBadge}>
                <Phone size={18} color={Colors.cocoa} weight="fill" />
              </View>

              {expanded ? (
                <View style={styles.expandedCopy}>
                  <Text style={styles.lineSoft} numberOfLines={1}>
                    혼자 견디지 않아도 괜찮아요
                  </Text>
                  <Text style={styles.lineStrong} numberOfLines={1}>
                    도움 받을 곳을 알려 드릴게요
                  </Text>
                </View>
              ) : (
                <View style={styles.collapsedCopy}>
                  <Text style={styles.collapsedLabel}>마음</Text>
                  <Text style={styles.collapsedLabel}>상담</Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>

      <HelpContactsSheet visible={sheetOpen} onClose={onCloseSheet} />
    </>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 0,
    zIndex: 24,
  },
  sticker: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 8,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.accentSoft,
    overflow: 'hidden',
  },
  phoneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginRight: 8,
    flexShrink: 0,
  },
  collapsedCopy: {
    justifyContent: 'center',
    gap: 0,
    flexShrink: 0,
  },
  expandedCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
    paddingRight: 2,
  },
  collapsedLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  lineSoft: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  lineStrong: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.3,
  },
  pressed: {
    opacity: 0.92,
  },
})
