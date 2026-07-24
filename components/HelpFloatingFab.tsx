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
 * 대화 — 우측 전화기 플로팅.
 * 탭 → 코코아 안내 배너 → 배너 탭 시 상담 기관 시트.
 * 위기·도움용이라 Primary 코랄 금지 → cocoa/selected.
 */
export function HelpFloatingFab({
  visible = true,
  bottom = 120,
  style,
}: HelpFloatingFabProps) {
  const [bannerOpen, setBannerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const bannerOpacity = useRef(new Animated.Value(0)).current
  const bannerX = useRef(new Animated.Value(24)).current
  const pressScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!visible) {
      scale.setValue(0)
      opacity.setValue(0)
      bannerOpacity.setValue(0)
      bannerX.setValue(24)
      setBannerOpen(false)
      setSheetOpen(false)
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
  }, [visible, scale, opacity, bannerOpacity, bannerX])

  if (!visible) return null

  const pulsePress = () => {
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

  const showBanner = () => {
    pulsePress()
    setBannerOpen(true)
    bannerOpacity.setValue(0)
    bannerX.setValue(28)
    Animated.parallel([
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(bannerX, {
        toValue: 0,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const openSheet = () => {
    pulsePress()
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
          {bannerOpen ? (
            <Animated.View
              style={{
                opacity: bannerOpacity,
                transform: [{ translateX: bannerX }],
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="도움 받을 곳 보기"
                accessibilityHint="전문 상담 기관 연락처가 열려요"
                onPress={openSheet}
                style={({ pressed }) => [
                  styles.banner,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.bannerIcon}>
                  <Phone size={18} color="#FFFFFF" weight="fill" />
                </View>
                <View style={styles.bannerCopy}>
                  <Text style={styles.bannerTitle}>
                    혼자 견디지 않아도 괜찮아요
                  </Text>
                  <Text style={styles.bannerSub}>
                    도움 받을 곳을 알려 드릴게요
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="도움 받을 곳 보기"
              accessibilityHint="도움 안내가 열려요"
              onPress={showBanner}
              hitSlop={8}
              style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
            >
              <Phone size={22} color={Colors.selected} weight="fill" />
            </Pressable>
          )}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  banner: {
    maxWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: Colors.cocoa,
    shadowColor: Colors.cocoa,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  bannerCopy: {
    flexShrink: 1,
    gap: 2,
    paddingRight: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.creamyBeige,
  },
  pressed: {
    opacity: 0.92,
  },
})
