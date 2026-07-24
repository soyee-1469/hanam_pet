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
 * 대화 — 우측 「마음상담」 플로팅.
 * Accent 옐로 면 + 전화기 아이콘, 탭 시 상담 기관 시트.
 * 위기·도움용이라 Primary 코랄 금지.
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
            accessibilityLabel="마음상담"
            accessibilityHint="전문 상담 기관 연락처가 열려요"
            onPress={openSheet}
            hitSlop={8}
            style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
          >
            <Phone size={20} color={Colors.cocoa} weight="fill" />
            <Text style={styles.label}>마음상담</Text>
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
    alignItems: 'flex-end',
  },
  fab: {
    minWidth: 56,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.92,
  },
})
