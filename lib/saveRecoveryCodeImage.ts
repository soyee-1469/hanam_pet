import type { RefObject } from 'react'
import type { View } from 'react-native'

export type SaveRecoveryCodeResult = 'saved' | 'denied' | 'unsupported' | 'error'

/** 웹·SSR 기본 — view-shot / media-library를 절대 로드하지 않음 */
export async function saveRecoveryCodeImage(
  _viewRef: RefObject<View | null>,
): Promise<SaveRecoveryCodeResult> {
  return 'unsupported'
}
