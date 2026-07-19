import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { Colors } from '../constants/Colors'
import { isOnboardingCompleted } from '../lib/onboardingStorage'
import { resetCoachmarkWelcome } from '../lib/coachmarkStorage'
import { resetHomeGuideTips } from '../lib/homeGuideTipsStorage'
import { seedCareUseReadyForDev } from '../lib/petStock'

/**
 * 앱 시작점.
 * - 온보딩 미완료 → 스플래시 → 게이트부터 시작
 * - 온보딩 완료 → 나의 펫(탭)
 */
export default function EntryScreen() {
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const completed = await isOnboardingCompleted()
        // DEV: 홈 검수용 상태 초기화 (온보딩 완료 후에만)
        if (__DEV__ && completed) {
          await resetCoachmarkWelcome()
          await resetHomeGuideTips()
          await seedCareUseReadyForDev()
        }
        if (alive) setDone(completed)
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  if (done) return <Redirect href="/(tabs)" />
  return <Redirect href="/onboarding/splash" />
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
})
