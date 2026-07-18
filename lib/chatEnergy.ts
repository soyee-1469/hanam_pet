import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'hp_chat_energy'
/** 데모용 하루 대화 횟수 — 질문 1회당 1 차감 */
export const CHAT_ENERGY_MAX = 2
export const CHAT_ENERGY_COST = 1

export async function loadChatEnergy(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (raw == null) return CHAT_ENERGY_MAX
    const n = Number(raw)
    if (!Number.isFinite(n)) return CHAT_ENERGY_MAX
    return Math.max(0, Math.min(CHAT_ENERGY_MAX, Math.floor(n)))
  } catch {
    return CHAT_ENERGY_MAX
  }
}

export async function saveChatEnergy(value: number): Promise<void> {
  const next = Math.max(0, Math.min(CHAT_ENERGY_MAX, Math.floor(value)))
  try {
    await AsyncStorage.setItem(KEY, String(next))
  } catch {
    // ignore
  }
}

/** 성공 시 남은 에너지, 실패 시 null */
export async function spendChatEnergy(
  cost = CHAT_ENERGY_COST,
): Promise<number | null> {
  const current = await loadChatEnergy()
  if (current < cost) return null
  const next = current - cost
  await saveChatEnergy(next)
  return next
}

export async function refillChatEnergy(): Promise<number> {
  await saveChatEnergy(CHAT_ENERGY_MAX)
  return CHAT_ENERGY_MAX
}
