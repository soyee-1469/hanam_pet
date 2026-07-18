import { Redirect } from 'expo-router'

/** 앱 시작점 → 메인(나의 펫) */
export default function EntryScreen() {
  return <Redirect href="/(tabs)" />
}
