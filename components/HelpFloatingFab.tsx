import { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Colors } from '../constants/Colors'
import { HelpContactsSheet } from './HelpContactsSheet'

type HelpFloatingFabProps = {
  visible?: boolean
  /** 입력창·탭바 위로 띄울 하단 inset */
  bottom?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 대화 — 우측 「109 / 마음 상담」 플로팅.
 * 등장 시 스프링 「뿅」, 탭하면 상담 기관 시트.
 * 위기·도움용 → Accent 옐로 (Primary 코랄 금지).
 */
export function HelpFloatingFab({
  visible = true,
  bottom = 120,
  style,
}: HelpFloatingFabProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const pressScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!visible) {
      scale.setValue(0)
      opacity.setValue(0)
      return
    }
    scale.setValue(0.55)
    opacity.setValue(0)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, scale, opacity])

  if (!visible) return null

  const openSheet = () => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.9,
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
    setSheetOpen(true)
  }

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          { bottom, opacity, transform: [{ scale }] },
          style,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="마음 상담, 109"
            accessibilityHint="전문 상담 기관 연락처가 열려요"
            onPress={openSheet}
            hitSlop={8}
            style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
          >
            <Text style={styles.num}>109</Text>
            <Text style={styles.label}>마음 상담</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      <HelpContactsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    zIndex: 24,
    elevation: 12,
  },
  fab: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.92,
  },
  num: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cocoa,
  },
})
