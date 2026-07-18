type ToastOptions = {
  /** 하단에서 띄울 추가 여백 (고정 CTA 위에 올릴 때) */
  bottomOffset?: number
}

type ToastPayload = {
  message: string
  bottomOffset?: number
}

type ToastListener = (payload: ToastPayload) => void

const listeners = new Set<ToastListener>()

/** 화면 전환 후에도 보이도록 전역 토스트 */
export function showToast(message: string, options?: ToastOptions) {
  const payload: ToastPayload = {
    message,
    bottomOffset: options?.bottomOffset,
  }
  listeners.forEach((fn) => fn(payload))
}

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
