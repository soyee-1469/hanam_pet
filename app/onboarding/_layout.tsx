import { Colors } from '../../constants/Colors'
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: Colors.background, flex: 1 } }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="gate" />
      <Stack.Screen name="welcome-prep" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="pet-chat" />
      <Stack.Screen name="diary-record" />
      <Stack.Screen name="mind-check" />
      <Stack.Screen name="healing-content" />
      <Stack.Screen name="pet-care" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="restore-code" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="pet-select" />
      <Stack.Screen name="resume-intro" />
      <Stack.Screen name="resume" />
    </Stack>
  )
}
