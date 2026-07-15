import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { Colors } from '../constants/Colors'
import { isOnboardingCompleted } from '../lib/onboardingStorage'

export default function EntryScreen() {
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const completed = await isOnboardingCompleted()
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
