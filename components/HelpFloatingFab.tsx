import { useEffect, useRef, useState } from 'react'
import {
  View,
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
import { Layout } from '../constants/Layout'
import { HelpContactsSheet } from './HelpContactsSheet'

type HelpFloatingFabProps = {
  /** absolute bottom inset (composer·탭바 위) */
  bottom: number
  visible?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * 대화 — 도움 플로팅 버튼.
 * 등장 시 스프링으로 「뿅」, 탭하면 상담 기관 시트.
 * 위기·도움용이라 Primary 코랄 금지 → cocoa/selected.
 */
export function HelpFloatingFab({
  bottom,
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
        pointerEvents="box-none"
        style={[
          styles.wrap,
          { bottom },
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
            style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
          >
            <View style={styles.iconWell}>
              <Phone size={18} color={Colors.surface} weight="fill" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title} numberOfLines={1}>
                혼자 견디지 않아도 괜찮아요
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                도움 받을 곳을 알려 드릴게요
              </Text>
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
    left: Layout.screenPaddingH,
    right: Layout.screenPaddingH,
    zIndex: 40,
    elevation: 16,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.selected,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Shadows.elevation,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  pressed: {
    opacity: 0.92,
  },
})
