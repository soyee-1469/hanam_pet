import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="gate" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="pet-select" />
      <Stack.Screen name="ai-notice" />
      <Stack.Screen name="resume" />
    </Stack>
  )
}
