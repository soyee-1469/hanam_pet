/**
 * 대화 에너지 API — 실제 값은 petStock 에너지와 동일(단일화).
 * 기존 import 경로 호환용 래퍼.
 */
import {
  ENERGY_CHAT_COST,
  ENERGY_MAX,
  loadPetStock,
  savePetStock,
  spendEnergy,
} from './petStock'

export const CHAT_ENERGY_MAX = ENERGY_MAX
export const CHAT_ENERGY_COST = ENERGY_CHAT_COST

export async function loadChatEnergy(): Promise<number> {
  const stock = await loadPetStock()
  return stock.energy
}

export async function saveChatEnergy(value: number): Promise<number> {
  const stock = await loadPetStock()
  const saved = await savePetStock({
    ...stock,
    energy: Math.max(0, Math.min(ENERGY_MAX, Math.floor(value))),
  })
  return saved.energy
}

export async function spendChatEnergy(
  cost = CHAT_ENERGY_COST,
): Promise<number | null> {
  const next = await spendEnergy(cost)
  return next?.energy ?? null
}

/** @deprecated 가득 채우기 대신 addEnergy 사용 권장 */
export async function refillChatEnergy(): Promise<number> {
  const stock = await loadPetStock()
  const saved = await savePetStock({ ...stock, energy: ENERGY_MAX })
  return saved.energy
}
