import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'
import '../global.css'
import { AppViewport } from '../components/AppViewport'
import { ToastHost } from '../components/ToastHost'

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
          <Stack.Screen name="diary-done" />
          <Stack.Screen name="diary-list" />
          <Stack.Screen name="diary-detail" />
          <Stack.Screen name="storage" />
          <Stack.Screen name="attendance" />
          <Stack.Screen name="account" />
          <Stack.Screen name="guide" />
          <Stack.Screen name="guide-doc" />
          <Stack.Screen name="counseling" />
          <Stack.Screen name="data-manage" />
          <Stack.Screen name="mind-records" />
          <Stack.Screen name="support" />
          <Stack.Screen name="chat-help" />
          <Stack.Screen name="withdraw" />
          <Stack.Screen name="withdraw-done" />
          <Stack.Screen name="mind-content" />
          <Stack.Screen name="mind-check-intro" />
          <Stack.Screen name="mind-check" />
          <Stack.Screen name="mind-check-result" />
          <Stack.Screen name="mind-check-guide" />
          <Stack.Screen name="mind-report" />
          <Stack.Screen name="notifications" />
        </Stack>
        <ToastHost />
      </AppViewport>
    </SafeAreaProvider>
  )
}
