import { useEffect, useRef, useState } from 'react'
import {
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Phone } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { HelpContactsSheet } from './HelpContactsSheet'

type HelpFloatingFabProps = {
  visible?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * 대화 — 채팅 입력창 위 우측 도움 플로팅 버튼.
 * 등장 시 스프링 「뿅」, 탭하면 상담 기관 시트.
 * 위기·도움용이라 Primary 코랄 금지 → cocoa/selected.
 */
export function HelpFloatingFab({
  visible = true,
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
        toValue: 0.92,
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
        style={[
          styles.wrap,
          { opacity, transform: [{ scale }] },
          style,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="도움 받을 곳 보기"
            accessibilityHint="전문 상담 기관 연락처가 열려요"
            onPress={openSheet}
            hitSlop={8}
            style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
          >
            <Phone size={18} color={Colors.selected} weight="fill" />
            <Text style={styles.label}>도움</Text>
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
    alignSelf: 'flex-end',
    zIndex: 2,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    ...Shadows.elevation,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.selected,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.9,
  },
})
