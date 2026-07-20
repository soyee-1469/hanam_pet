import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { dayKey } from './dayKey'
import { resetPetClaimState } from './petClaimCooldown'

const KEY = 'hp_pet_stock_v1'
const DAILY_KEY = 'hp_pet_daily_v1'
/** 레거시 대화 에너지(0~2) — 한 번만 마이그레이션 */
const LEGACY_CHAT_KEY = 'hp_chat_energy'

/** 보관함·펫 홈·대화가 공유하는 에너지 상한 */
export const ENERGY_MAX = 50
export const FOOD_MAX = 5
export const TOY_MAX = 5

/** 하루 에너지 적립 상한 (정책) */
export const ENERGY_DAILY_EARN_CAP = 20
/** 사료 주기·놀아 주기 일일 사용 상한 */
export const CARE_USE_MAX_PER_DAY = 2
/** 대화(질문) 일일 사용 상한 — 1회당 에너지 1 */
export const CHAT_USE_MAX_PER_DAY = 50

export const ENERGY_CHAT_COST = 1
/** 사료 제공 완료 시 — 정책 5.1: 회당 +4 */
export const ENERGY_FEED_GAIN = 4
/** 놀이 완료 시 — 정책 5.1: 회당 +4 */
export const ENERGY_PLAY_GAIN = 4
export const ENERGY_DIARY_GAIN = 2
export const ENERGY_ATTEND_GAIN = 12

export type PetStock = {
  energy: number
  food: number
  toy: number
}

export type PetDailyState = {
  /** YYYY-MM-DD Asia/Seoul */
  day: string
  /** 오늘 실제로 적립된 에너지 합 */
  energyEarned: number
  feedUses: number
  playUses: number
  /** 오늘 대화(질문) 횟수 */
  chatUses: number
  /** 오늘 일기 첫 저장으로 +2를 이미 줬는지 */
  diaryGranted: boolean
}

export type AddEnergyResult = {
  stock: PetStock
  requested: number
  credited: number
  /** 일일 +20 한도로 잘림 */
  cappedByDaily: boolean
  /** 보유 상한 50으로 잘림 */
  cappedByMax: boolean
  dailyEarned: number
}

export type CareUseKind = 'feed' | 'play'

export type CareUseGate =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'daily_max'; used: number }

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

function emptyDaily(day = dayKey()): PetDailyState {
  return {
    day,
    energyEarned: 0,
    feedUses: 0,
    playUses: 0,
    chatUses: 0,
    diaryGranted: false,
  }
}

function normalizeDaily(raw: Partial<PetDailyState> | null): PetDailyState {
  const today = dayKey()
  if (!raw || raw.day !== today) return emptyDaily(today)
  return {
    day: today,
    energyEarned: Math.max(
      0,
      Math.min(ENERGY_DAILY_EARN_CAP, Math.floor(Number(raw.energyEarned) || 0)),
    ),
    feedUses: Math.max(
      0,
      Math.min(CARE_USE_MAX_PER_DAY, Math.floor(Number(raw.feedUses) || 0)),
    ),
    playUses: Math.max(
      0,
      Math.min(CARE_USE_MAX_PER_DAY, Math.floor(Number(raw.playUses) || 0)),
    ),
    chatUses: Math.max(
      0,
      Math.min(CHAT_USE_MAX_PER_DAY, Math.floor(Number(raw.chatUses) || 0)),
    ),
    diaryGranted: Boolean(raw.diaryGranted),
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

export async function loadPetDailyState(): Promise<PetDailyState> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_KEY)
    if (!raw) return emptyDaily()
    return normalizeDaily(JSON.parse(raw) as Partial<PetDailyState>)
  } catch {
    return emptyDaily()
  }
}

async function savePetDailyState(state: PetDailyState): Promise<PetDailyState> {
  const next = normalizeDaily(state)
  try {
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

/**
 * 에너지 적립 — 일일 +20·보유 50 한도 적용.
 * leftover는 적립되지 않음.
 */
export async function addEnergy(amount: number): Promise<AddEnergyResult> {
  const requested = Math.max(0, Math.floor(amount))
  const prev = await loadPetStock()
  const daily = await loadPetDailyState()

  if (requested <= 0) {
    return {
      stock: prev,
      requested: 0,
      credited: 0,
      cappedByDaily: false,
      cappedByMax: false,
      dailyEarned: daily.energyEarned,
    }
  }

  const roomDaily = Math.max(0, ENERGY_DAILY_EARN_CAP - daily.energyEarned)
  const roomMax = Math.max(0, ENERGY_MAX - prev.energy)
  const credited = Math.min(requested, roomDaily, roomMax)

  const stock =
    credited > 0
      ? await savePetStock({
          ...prev,
          energy: clamp(prev.energy + credited, ENERGY_MAX),
        })
      : prev

  const nextDaily =
    credited > 0
      ? await savePetDailyState({
          ...daily,
          energyEarned: daily.energyEarned + credited,
        })
      : daily

  return {
    stock,
    requested,
    credited,
    cappedByDaily: credited < requested && roomDaily < roomMax,
    cappedByMax: credited < requested && roomMax <= roomDaily,
    dailyEarned: nextDaily.energyEarned,
  }
}

/** UX 문구 — 부분·0 적립 안내 */
export function energyCreditMessage(result: AddEnergyResult): string | null {
  if (result.requested <= 0) return null
  if (result.credited === 0) {
    if (result.stock.energy >= ENERGY_MAX) {
      return '에너지가 가득해서 적립되지 않았어요'
    }
    if (result.dailyEarned >= ENERGY_DAILY_EARN_CAP) {
      return '오늘 받을 수 있는 에너지를 모두 받았어요'
    }
    return '에너지를 적립하지 못했어요'
  }
  if (result.credited < result.requested) {
    return `+${result.credited}만 적립됐어요`
  }
  return null
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

export async function getCareUseGate(
  kind: CareUseKind,
): Promise<CareUseGate> {
  const daily = await loadPetDailyState()
  const used = kind === 'feed' ? daily.feedUses : daily.playUses
  if (used >= CARE_USE_MAX_PER_DAY) {
    return { ok: false, reason: 'daily_max', used }
  }
  return { ok: true, remaining: CARE_USE_MAX_PER_DAY - used }
}

export async function recordCareUse(
  kind: CareUseKind,
): Promise<PetDailyState> {
  const daily = await loadPetDailyState()
  if (kind === 'feed') {
    return savePetDailyState({
      ...daily,
      feedUses: Math.min(CARE_USE_MAX_PER_DAY, daily.feedUses + 1),
    })
  }
  return savePetDailyState({
    ...daily,
    playUses: Math.min(CARE_USE_MAX_PER_DAY, daily.playUses + 1),
  })
}

export type ChatUseGate =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'daily_max' | 'no_energy'; used: number; energy: number }

/** 대화 전송 가능 여부 — 에너지 1 + 일 50회 */
export async function getChatUseGate(): Promise<ChatUseGate> {
  const daily = await loadPetDailyState()
  const stock = await loadPetStock()
  if (daily.chatUses >= CHAT_USE_MAX_PER_DAY) {
    return {
      ok: false,
      reason: 'daily_max',
      used: daily.chatUses,
      energy: stock.energy,
    }
  }
  if (stock.energy < ENERGY_CHAT_COST) {
    return {
      ok: false,
      reason: 'no_energy',
      used: daily.chatUses,
      energy: stock.energy,
    }
  }
  return {
    ok: true,
    remaining: CHAT_USE_MAX_PER_DAY - daily.chatUses,
  }
}

export async function recordChatUse(): Promise<PetDailyState> {
  const daily = await loadPetDailyState()
  return savePetDailyState({
    ...daily,
    chatUses: Math.min(CHAT_USE_MAX_PER_DAY, daily.chatUses + 1),
  })
}

/**
 * __DEV__ 전용 — 「사료 주기」「놀아 주기」·「받기」바로 눌러볼 수 있게
 * 재고·일일 사용 카운트·사료/장난감 claim 쿨다운을 검수용 베이스라인으로 맞춤.
 */
export async function seedCareUseReadyForDev(): Promise<PetStock> {
  const stock = await savePetStock({
    energy: 20,
    food: 3,
    toy: 3,
  })
  const daily = await loadPetDailyState()
  await savePetDailyState({
    ...daily,
    energyEarned: 0,
    feedUses: 0,
    playUses: 0,
  })
  await resetPetClaimState()
  return stock
}

/**
 * 일기 첫 저장 1회만 +ENERGY_DIARY_GAIN.
 * 이미 지급했거나 한도로 0이면 credited=0.
 */
export async function tryGrantDiaryEnergy(): Promise<
  AddEnergyResult & { alreadyGranted: boolean }
> {
  const daily = await loadPetDailyState()
  if (daily.diaryGranted) {
    const stock = await loadPetStock()
    return {
      stock,
      requested: ENERGY_DIARY_GAIN,
      credited: 0,
      cappedByDaily: false,
      cappedByMax: false,
      dailyEarned: daily.energyEarned,
      alreadyGranted: true,
    }
  }
  await savePetDailyState({ ...daily, diaryGranted: true })
  const result = await addEnergy(ENERGY_DIARY_GAIN)
  return { ...result, alreadyGranted: false }
}

/** 에너지 바 색 — 전 구간 Accent 옐로 */
export function energyBarColor(_energy: number) {
  return Colors.energyFill
}
