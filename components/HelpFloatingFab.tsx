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

/**
 * 대화 — 우측 가장자리 「마음 상담」 스티커.
 * 1차 탭: 긴급 안내 문구로 가로 확장 / 2차 탭: 상담 연락처 시트.
 * 스크롤과 무관하게 입력창 위 우측에 고정.
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
    appearScale.setValue(0.55)
    appearOpacity.setValue(0)
    Animated.parallel([
      Animated.spring(appearScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(appearOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, appearScale, appearOpacity, expandProgress])

  useEffect(() => {
    Animated.spring(expandProgress, {
      toValue: expanded ? 1 : 0,
      friction: 7,
      tension: 120,
      useNativeDriver: false,
    }).start()
  }, [expanded, expandProgress])

  if (!visible) return null

  const bumpPress = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
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
    outputRange: [72, 268],
  })
  const collapsedOpacity = expandProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 0, 0],
  })
  const expandedOpacity = expandProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0, 1],
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
                : '마음 상담, 혼자 견디지 않아도 괜찮아요'
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
                <Phone size={22} color={Colors.primary} weight="fill" />
              </View>

              <View style={styles.copySlot} pointerEvents="none">
                <Animated.View
                  style={[styles.collapsedCopy, { opacity: collapsedOpacity }]}
                >
                  <Text style={styles.collapsedLabel}>마음</Text>
                  <Text style={styles.collapsedLabel}>상담</Text>
                </Animated.View>
                <Animated.View
                  style={[styles.expandedCopy, { opacity: expandedOpacity }]}
                >
                  <Text style={styles.lineSoft}>혼자 견디지 않아도 괜찮아요</Text>
                  <Text style={styles.lineStrong}>
                    도움 받을 곳을 알려 드릴게요
                  </Text>
                </Animated.View>
              </View>
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
    elevation: 14,
  },
  sticker: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 10,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.accentSoft,
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: Colors.surface,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 10,
    overflow: 'hidden',
  },
  phoneBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  copySlot: {
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  collapsedCopy: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    gap: 1,
  },
  expandedCopy: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    gap: 2,
    paddingRight: 4,
  },
  collapsedLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  lineSoft: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  lineStrong: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.3,
  },
  pressed: {
    opacity: 0.94,
  },
})
