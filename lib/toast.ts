type ToastListener = (message: string) => void

const listeners = new Set<ToastListener>()

/** 화면 전환 후에도 보이도록 전역 토스트 */
export function showToast(message: string) {
  listeners.forEach((fn) => fn(message))
}

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
