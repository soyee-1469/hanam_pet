import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
} from '../lib/onboardingStorage'
import { resetCoachmarkWelcome } from '../lib/coachmarkStorage'
import { resetHomeGuideTips } from '../lib/homeGuideTipsStorage'
import { resetPetClaimState } from '../lib/petClaimCooldown'

/**
 * 피그마 맞춤 검수 중: 온보딩(A) 완료 후 탭(B~) 검수.
 * 온보딩 다시 보려면 `/onboarding/splash` 로 직접 이동.
 */
export default function EntryScreen() {
  useEffect(() => {
    let alive = true
    void (async () => {
      const done = await isOnboardingCompleted()
      if (!done) await markOnboardingCompleted()
      // DEV: cm-01 시트 재확인용 (프로덕션에선 생략)
      if (__DEV__) {
        await resetCoachmarkWelcome()
        await resetHomeGuideTips()
        await resetPetClaimState()
      }
      if (!alive) return
      router.replace('/(tabs)')
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <View style={styles.boot}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
})
