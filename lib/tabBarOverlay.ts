/** 바텀시트·코치마크 등 전체 딤이 떠 있을 때 탭바 숨김 */

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
