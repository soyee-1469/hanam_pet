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
import { CaretLeft } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { HelpContactsSheet } from './HelpContactsSheet'

type HelpFloatingFabProps = {
  visible?: boolean
  /** 입력창·탭바 위로 띄울 하단 inset */
  bottom?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 대화 — 우측 가장자리 「109 / 마음 상담」 스티커.
 * Accent 옐로 면 + Primary 코랄 번호 + 흰 테두리·기울기·그림자로 스티커감.
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
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            bottom,
            opacity,
            transform: [{ scale }, { rotate: '-5deg' }],
          },
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
            <View style={styles.fabInner}>
              <View style={styles.chevron}>
                <CaretLeft size={12} color={Colors.selected} weight="bold" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.num}>109</Text>
                <Text style={styles.label}>마음 상담</Text>
              </View>
            </View>
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
    right: -2,
    zIndex: 24,
    elevation: 14,
  },
  fab: {
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 11,
    /** 화면 오른쪽 가장자리에 붙는 스티커 */
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 3,
    borderColor: Colors.surface,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: -2, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 10,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chevron: {
    marginRight: 0,
  },
  copy: {
    alignItems: 'center',
    gap: 1,
  },
  pressed: {
    opacity: 0.94,
  },
  num: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.cocoa,
  },
})
