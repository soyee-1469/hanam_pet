import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import * as MediaLibrary from 'expo-media-library'

type SaveRecoveryCodeResult = 'saved' | 'denied' | 'unsupported' | 'error'

/** iOS/Android 전용 — 카드 캡처 후 사진첩 저장 */
export async function saveRecoveryCodeImage(
  viewRef: RefObject<View | null>,
): Promise<SaveRecoveryCodeResult> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync(true)
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
