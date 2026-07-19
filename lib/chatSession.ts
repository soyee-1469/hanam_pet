/** 대화 세션 초기화 — 메시지는 탭 메모리에만 있어 토큰으로 비움 */

type Listener = () => void

let clearToken = 0
const listeners = new Set<Listener>()

export function getChatClearToken(): number {
  return clearToken
}

export function clearChatSession(): void {
  clearToken += 1
  listeners.forEach((l) => l())
}

export function subscribeChatClear(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
