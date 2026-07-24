import { useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Heart } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { resetOnboardingCompleted } from '../../lib/onboardingStorage'
import { seedCareUseReadyForDev } from '../../lib/petStock'

const HOLD_MS = 1800

/**
 * 처음 진입 스플래시 — 크림 배경 + 하치·나미 함께 있는 히어로.
 * 문구 없이 짧게 보여 준 뒤 게이트로 이동.
 */
export default function OnboardingSplash() {
  const { reset } = useLocalSearchParams<{ reset?: string }>()

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    let alive = true
    ;(async () => {
      if (reset === '1') {
        await resetOnboardingCompleted()
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
      <View style={styles.body} accessibilityLabel="하치와 나미">
        <View style={styles.hero}>
          <View style={styles.duo}>
            <Image
              source={DogExpr.soft}
              style={styles.dog}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Image
              source={CatExpr.soft}
              style={styles.cat}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
          <View style={styles.ground}>
            <View style={styles.groundLine} />
            <View style={styles.heart}>
              <Heart size={18} color={Colors.primary} weight="fill" />
            </View>
          </View>
        </View>
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
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  duo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dog: {
    width: 168,
    height: 168,
    marginRight: -28,
    zIndex: 1,
  },
  cat: {
    width: 132,
    height: 132,
    marginBottom: 4,
    zIndex: 2,
  },
  ground: {
    marginTop: -6,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundLine: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.beige,
  },
  heart: {
    position: 'absolute',
    right: 18,
    top: -10,
  },
})
