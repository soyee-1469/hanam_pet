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
    // 시스템 권한 팝업(허용 / 허용 안 함) — writeOnly면 Add-only라 문구가 달라질 수 있음
    const permission = await MediaLibrary.requestPermissionsAsync()
    if (!permission.granted) return 'denied'

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
