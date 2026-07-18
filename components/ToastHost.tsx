import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { subscribeToast } from '../lib/toast'

const SHOW_MS = 2200
const easeOut = Easing.out(Easing.cubic)

/**
 * 하단 캡슐 토스트 — 루트에 한 번만 마운트
 */
export function ToastHost() {
  const insets = useSafeAreaInsets()
  const [message, setMessage] = useState<string | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return subscribeToast((next) => {
      if (timer.current) clearTimeout(timer.current)
      setMessage(next)
      opacity.setValue(0)
      translateY.setValue(12)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]).start()

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            easing: easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 8,
            duration: 200,
            easing: easeOut,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) setMessage(null)
        })
      }, SHOW_MS)
    })
  }, [opacity, translateY])

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  if (!message) return null

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 24 }]}
    >
      <Animated.View
        style={[
          styles.toast,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },
  toast: {
    backgroundColor: 'rgba(70, 55, 45, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '86%',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
})
