/**
 * 대화 에너지 API — 실제 값은 petStock 에너지와 동일(단일화).
 * 질문 1회 = 에너지 1, 하루 최대 50회.
 */
import {
  CHAT_USE_MAX_PER_DAY,
  ENERGY_CHAT_COST,
  ENERGY_MAX,
  getChatUseGate,
  loadPetDailyState,
  loadPetStock,
  recordChatUse,
  savePetStock,
  spendEnergy,
  type ChatUseGate,
} from './petStock'

export const CHAT_ENERGY_MAX = ENERGY_MAX
export const CHAT_ENERGY_COST = ENERGY_CHAT_COST
export { CHAT_USE_MAX_PER_DAY, type ChatUseGate }

export async function loadChatEnergy(): Promise<number> {
  const stock = await loadPetStock()
  return stock.energy
}

export async function loadChatUsesToday(): Promise<number> {
  const daily = await loadPetDailyState()
  return daily.chatUses
}

/** 에너지 부족 또는 오늘 50회 도달 */
export async function isChatDepleted(): Promise<boolean> {
  const gate = await getChatUseGate()
  return !gate.ok
}

export async function saveChatEnergy(value: number): Promise<number> {
  const stock = await loadPetStock()
  const saved = await savePetStock({
    ...stock,
    energy: Math.max(0, Math.min(ENERGY_MAX, Math.floor(value))),
  })
  return saved.energy
}

/**
 * 질문 1회 — 에너지 1 차감 + 일일 횟수 +1.
 * 실패 시 null (에너지 부족·일 50회 초과).
 */
export async function spendChatEnergy(
  cost = CHAT_ENERGY_COST,
): Promise<number | null> {
  const gate = await getChatUseGate()
  if (!gate.ok) return null

  const next = await spendEnergy(cost)
  if (next == null) return null

  await recordChatUse()
  return next.energy
}

/** @deprecated 가득 채우기 대신 addEnergy 사용 권장 */
export async function refillChatEnergy(): Promise<number> {
  const stock = await loadPetStock()
  const saved = await savePetStock({ ...stock, energy: ENERGY_MAX })
  return saved.energy
}
