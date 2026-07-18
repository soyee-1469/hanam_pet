import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'hp_pet_claim_cooldown_v1'

/** 하루 최대 수령 횟수 (시안·안내 문구) */
export const CLAIM_MAX_PER_DAY = 2

/** 수령 후 다음 제작까지 — 사료 */
export const FEED_COOLDOWN_MS = __DEV__
  ? 3 * 60 * 1000
  : 4 * 60 * 60 * 1000

/** 수령 후 다음 제작까지 — 장난감 */
export const TOY_COOLDOWN_MS = __DEV__
  ? 2 * 60 * 1000
  : 45 * 60 * 1000

export type ClaimKind = 'feed' | 'toy'

type ClaimBucket = {
  /** YYYY-MM-DD */
  day: string
  count: number
  /** 다음 수령 가능 시각 (ms). 0이면 즉시 가능 */
  nextReadyAt: number
}

export type PetClaimState = {
  feed: ClaimBucket
  toy: ClaimBucket
}

function dayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function emptyBucket(): ClaimBucket {
  return { day: dayKey(), count: 0, nextReadyAt: 0 }
}

function normalizeBucket(raw: Partial<ClaimBucket> | undefined): ClaimBucket {
  const today = dayKey()
  const day = typeof raw?.day === 'string' ? raw.day : today
  const count = Number(raw?.count) || 0
  const nextReadyAt = Number(raw?.nextReadyAt) || 0
  if (day !== today) {
    return emptyBucket()
  }
  return {
    day,
    count: Math.max(0, Math.min(CLAIM_MAX_PER_DAY, Math.floor(count))),
    nextReadyAt: Math.max(0, nextReadyAt),
  }
}

function normalize(raw: Partial<PetClaimState> | null): PetClaimState {
  return {
    feed: normalizeBucket(raw?.feed),
    toy: normalizeBucket(raw?.toy),
  }
}

export async function loadPetClaimState(): Promise<PetClaimState> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return { feed: emptyBucket(), toy: emptyBucket() }
    return normalize(JSON.parse(raw) as Partial<PetClaimState>)
  } catch {
    return { feed: emptyBucket(), toy: emptyBucket() }
  }
}

async function savePetClaimState(state: PetClaimState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(normalize(state)))
}

/** 자정(다음 날 00:00)까지 ms */
export function msUntilMidnight(now = Date.now()): number {
  const d = new Date(now)
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return Math.max(0, next.getTime() - now)
}

export function formatClaimCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export type ClaimMenuStatus =
  | { kind: 'ready' }
  | { kind: 'cooldown'; remainingMs: number; label: string }
  | { kind: 'idle' }

export function getClaimMenuStatus(
  bucket: ClaimBucket,
  now = Date.now(),
): ClaimMenuStatus {
  const b = normalizeBucket(bucket)
  if (b.nextReadyAt > now) {
    const remainingMs = b.nextReadyAt - now
    return {
      kind: 'cooldown',
      remainingMs,
      label: formatClaimCountdown(remainingMs),
    }
  }
  if (b.count >= CLAIM_MAX_PER_DAY) {
    const remainingMs = msUntilMidnight(now)
    return {
      kind: 'cooldown',
      remainingMs,
      label: formatClaimCountdown(remainingMs),
    }
  }
  return { kind: 'ready' }
}

export function canClaimNow(bucket: ClaimBucket, now = Date.now()): boolean {
  return getClaimMenuStatus(bucket, now).kind === 'ready'
}

/** 수령 성공 후 쿨다운·일일 카운트 반영 */
export async function recordPetClaim(
  kind: ClaimKind,
  now = Date.now(),
): Promise<PetClaimState> {
  const state = await loadPetClaimState()
  const cooldown = kind === 'feed' ? FEED_COOLDOWN_MS : TOY_COOLDOWN_MS
  const bucket = normalizeBucket(state[kind])
  const next: PetClaimState = {
    ...state,
    [kind]: {
      day: dayKey(new Date(now)),
      count: Math.min(CLAIM_MAX_PER_DAY, bucket.count + 1),
      nextReadyAt: now + cooldown,
    },
  }
  await savePetClaimState(next)
  return next
}

/** 개발/검수 */
export async function resetPetClaimState(): Promise<void> {
  await AsyncStorage.removeItem(KEY)
}
