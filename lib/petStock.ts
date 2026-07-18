import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'

const KEY = 'hp_pet_stock_v1'
/** 레거시 대화 에너지(0~2) — 한 번만 마이그레이션 */
const LEGACY_CHAT_KEY = 'hp_chat_energy'

/** 보관함·펫 홈·대화가 공유하는 에너지 상한 */
export const ENERGY_MAX = 50
export const FOOD_MAX = 5
export const TOY_MAX = 5

export const ENERGY_CHAT_COST = 1
export const ENERGY_FEED_GAIN = 2
export const ENERGY_PLAY_GAIN = 4
export const ENERGY_DIARY_GAIN = 2
export const ENERGY_ATTEND_GAIN = 2

export type PetStock = {
  energy: number
  food: number
  toy: number
}

const DEFAULT_STOCK: PetStock = {
  energy: 20,
  food: 1,
  toy: 3,
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(max, Math.floor(n)))
}

function normalize(raw: Partial<PetStock> | null | undefined): PetStock {
  return {
    energy: clamp(raw?.energy ?? DEFAULT_STOCK.energy, ENERGY_MAX),
    food: clamp(raw?.food ?? DEFAULT_STOCK.food, FOOD_MAX),
    toy: clamp(raw?.toy ?? DEFAULT_STOCK.toy, TOY_MAX),
  }
}

async function migrateLegacyChat(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_CHAT_KEY)
    if (raw == null) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    // 0~2 → 0 / 25 / 50 스케일로 옮김
    const mapped = clamp(Math.round(n) * 25, ENERGY_MAX)
    await AsyncStorage.removeItem(LEGACY_CHAT_KEY)
    return mapped
  } catch {
    return null
  }
}

export async function loadPetStock(): Promise<PetStock> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (raw) {
      return normalize(JSON.parse(raw) as Partial<PetStock>)
    }
    const legacy = await migrateLegacyChat()
    const next = normalize({
      ...DEFAULT_STOCK,
      ...(legacy != null ? { energy: legacy } : {}),
    })
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
    return next
  } catch {
    return { ...DEFAULT_STOCK }
  }
}

export async function savePetStock(stock: PetStock): Promise<PetStock> {
  const next = normalize(stock)
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

export async function updatePetStock(
  patch: Partial<PetStock> | ((prev: PetStock) => PetStock),
): Promise<PetStock> {
  const prev = await loadPetStock()
  const merged =
    typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
  return savePetStock(merged)
}

export async function addEnergy(amount: number): Promise<PetStock> {
  return updatePetStock((prev) => ({
    ...prev,
    energy: clamp(prev.energy + amount, ENERGY_MAX),
  }))
}

export async function spendEnergy(
  cost = ENERGY_CHAT_COST,
): Promise<PetStock | null> {
  const prev = await loadPetStock()
  if (prev.energy < cost) return null
  return savePetStock({
    ...prev,
    energy: clamp(prev.energy - cost, ENERGY_MAX),
  })
}

export async function addFood(amount = 1): Promise<PetStock | null> {
  const prev = await loadPetStock()
  if (prev.food >= FOOD_MAX) return null
  return savePetStock({
    ...prev,
    food: clamp(prev.food + amount, FOOD_MAX),
  })
}

export async function useFood(amount = 1): Promise<PetStock | null> {
  const prev = await loadPetStock()
  if (prev.food < amount) return null
  return savePetStock({
    ...prev,
    food: clamp(prev.food - amount, FOOD_MAX),
  })
}

export async function addToy(amount = 1): Promise<PetStock | null> {
  const prev = await loadPetStock()
  if (prev.toy >= TOY_MAX) return null
  return savePetStock({
    ...prev,
    toy: clamp(prev.toy + amount, TOY_MAX),
  })
}

export async function useToy(amount = 1): Promise<PetStock | null> {
  const prev = await loadPetStock()
  if (prev.toy < amount) return null
  return savePetStock({
    ...prev,
    toy: clamp(prev.toy - amount, TOY_MAX),
  })
}

/** 에너지 바 색 — 충분할 때만 primary */
export function energyBarColor(energy: number) {
  return energy >= ENERGY_MAX * 0.9 ? Colors.energyFill : Colors.energyFillMid
}
