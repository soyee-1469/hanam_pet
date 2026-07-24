import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import * as MediaLibrary from 'expo-media-library'

type SaveRecoveryCodeResult = 'saved' | 'denied' | 'unsupported' | 'error'

/** iOS/Android 전용 — 시스템 사진 권한 요청 후 카드 캡처·사진첩 저장 */
export async function saveRecoveryCodeImage(
  viewRef: RefObject<View | null>,
): Promise<SaveRecoveryCodeResult> {
  try {
    // iOS: 「사진 선택… / 모든 사진에 대한 접근 허용 / 허용 안 함」
    // writeOnly:false → 읽기 권한 다이얼로그(시안과 동일)
    const permission = await MediaLibrary.requestPermissionsAsync(false)
    const allowed =
      permission.granted || permission.accessPrivileges === 'limited'
    if (!allowed) return 'denied'

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    })
    await MediaLibrary.saveToLibraryAsync(uri)
    return 'saved'
  } catch {
    return 'error'
  }
}
