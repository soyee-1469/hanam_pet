import { useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { getOnboardingCopy } from '../../lib/onboarding'
import { resetOnboardingCompleted } from '../../lib/onboardingStorage'
import { seedCareUseReadyForDev } from '../../lib/petStock'

const HOLD_MS = 1800
const copy = getOnboardingCopy().splash

export default function OnboardingSplash() {
  const { reset } = useLocalSearchParams<{ reset?: string }>()

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    let alive = true
    ;(async () => {
      if (reset === '1') {
        await resetOnboardingCompleted()
        // DEV: 온보딩 리셋과 함께 사료·장난감 재고/사용/받기 쿨다운도 맞춤
        if (__DEV__) {
          await seedCareUseReadyForDev()
        }
      }
      if (!alive) return
      t = setTimeout(() => {
        router.replace('/onboarding/gate')
      }, HOLD_MS)
    })()
    return () => {
      alive = false
      if (t) clearTimeout(t)
    }
  }, [reset])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.iconGlow}>
          <View style={styles.iconWrap}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.body}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconGlow: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 84,
    height: 84,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
})
