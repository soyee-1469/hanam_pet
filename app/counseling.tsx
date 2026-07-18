import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

/** 레거시 경로 — 전문 상담은 /support 로 통합 */
export default function CounselingRedirect() {
  useEffect(() => {
    router.replace('/support')
  }, [])

  return <View />
}
