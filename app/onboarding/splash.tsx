import { useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { getOnboardingCopy, ONBOARDING_VERSION } from '../../lib/onboarding'
import { resetOnboardingCompleted } from '../../lib/onboardingStorage'

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
        <View style={styles.iconWrap}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.body}</Text>
        <Text style={styles.versionBadge}>온보딩 {ONBOARDING_VERSION}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.accentSoft,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: {
    width: 88,
    height: 88,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  versionBadge: {
    marginTop: 20,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
})
