import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'
import '../global.css'
import { AppViewport } from '../components/AppViewport'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppViewport>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="diary-write" />
          <Stack.Screen name="storage" />
        </Stack>
      </AppViewport>
    </SafeAreaProvider>
  )
}
