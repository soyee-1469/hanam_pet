/** 바텀시트·코치마크·키보드 등 — 탭바 숨김 락 */

import { useEffect } from 'react'
import { Keyboard, Platform } from 'react-native'

type Listener = () => void

let lockCount = 0
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export function isTabBarOverlayLocked(): boolean {
  return lockCount > 0
}

export function acquireTabBarOverlay(): void {
  lockCount += 1
  emit()
}

export function releaseTabBarOverlay(): void {
  lockCount = Math.max(0, lockCount - 1)
  emit()
}

export function subscribeTabBarOverlay(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * 소프트 키보드가 열려 있는 동안 하단 탭바를 숨긴다.
 * (tabs)/_layout 에서 한 번만 호출.
 */
export function useHideTabBarWhileKeyboard() {
  useEffect(() => {
    let held = false
    const lock = () => {
      if (held) return
      held = true
      acquireTabBarOverlay()
    }
    const unlock = () => {
      if (!held) return
      held = false
      releaseTabBarOverlay()
    }

    if (Platform.OS === 'web') {
      const vv =
        typeof window !== 'undefined' ? window.visualViewport : null
      if (!vv) return
      const sync = () => {
        const inset = Math.max(
          0,
          window.innerHeight - vv.height - vv.offsetTop,
        )
        if (inset > 60) lock()
        else unlock()
      }
      vv.addEventListener('resize', sync)
      vv.addEventListener('scroll', sync)
      sync()
      return () => {
        vv.removeEventListener('resize', sync)
        vv.removeEventListener('scroll', sync)
        unlock()
      }
    }

    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvt, lock)
    const hideSub = Keyboard.addListener(hideEvt, unlock)
    return () => {
      showSub.remove()
      hideSub.remove()
      unlock()
    }
  }, [])
}
