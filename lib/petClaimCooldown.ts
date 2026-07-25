import AsyncStorage from '@react-native-async-storage/async-storage'
import { dayKey, msUntilMidnight } from './dayKey'

const KEY = 'hp_pet_claim_cooldown_v2'

/** 하루 최대 수령 횟수 (시안·안내 문구) */
export const CLAIM_MAX_PER_DAY = 2

/** 수령 후 다음 제작까지 — 사료·장난감 공통 4시간 */
const CLAIM_COOLDOWN_MS = 4 * 60 * 60 * 1000

export const FEED_COOLDOWN_MS = CLAIM_COOLDOWN_MS
export const TOY_COOLDOWN_MS = CLAIM_COOLDOWN_MS
export type ClaimKind = 'feed' | 'toy'

type ClaimBucket = {
  /** YYYY-MM-DD (Asia/Seoul) */
  day: string
  count: number
  /** 다음 수령 가능 시각 (ms). 0이면 즉시 가능 */
  nextReadyAt: number
  /**
   * 당일 1차 수령 이후, 해당 종류를 한 번 이상 사용했는지.
   * 2차 수령 전 필수 (정책: 사용 후 재획득).
   */
  usedSinceClaim: boolean
}

export type PetClaimState = {
  feed: ClaimBucket
  toy: ClaimBucket
}

function emptyBucket(): ClaimBucket {
  return {
    day: dayKey(),
    count: 0,
    nextReadyAt: 0,
    usedSinceClaim: true,
  }
}

function normalizeBucket(raw: Partial<ClaimBucket> | undefined): ClaimBucket {
  const today = dayKey()
  const day = typeof raw?.day === 'string' ? raw.day : today
  const count = Number(raw?.count) || 0
  const nextReadyAt = Number(raw?.nextReadyAt) || 0
  if (day !== today) {
    return emptyBucket()
  }
  const usedSinceClaim =
    typeof raw?.usedSinceClaim === 'boolean'
      ? raw.usedSinceClaim
      : count === 0
  return {
    day,
    count: Math.max(0, Math.min(CLAIM_MAX_PER_DAY, Math.floor(count))),
    nextReadyAt: Math.max(0, nextReadyAt),
    usedSinceClaim,
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

export { msUntilMidnight }

export function formatClaimCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export type ClaimMenuStatus =
  | { kind: 'ready' }
  | {
      kind: 'cooldown'
      remainingMs: number
      label: string
      /**
       * 0 → 1 toward ready (fills as wait elapses).
       * Same second-ceil clock as `label` (HH:MM:SS).
       * Claim CD: elapsed / FEED|TOY_COOLDOWN_MS.
       * Daily cap: elapsed since last nextReadyAt → midnight.
       */
      progress: number
    }
  /** 1차 수령 후 사용 전 — 2차 수령 불가 */
  | { kind: 'need_use' }
  /** 하루 수령 횟수 소진 */
  | { kind: 'done' }
  | { kind: 'idle' }

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/**
 * Ring fills toward ready (0→1). Uses the same second-ceil clock as
 * formatClaimCountdown so the arc ticks with HH:MM:SS.
 */
function progressTowardReady(remainingMs: number, totalMs: number): number {
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000))
  const totalSec = Math.max(1, Math.round(totalMs / 1000))
  return clamp01(1 - remainingSec / totalSec)
}

/**
 * 메뉴 상태
 * - 0회: ready（받기）
 * - 1회: cooldown（타이머）— 남은 시간과 무관하게 표시, 2차 수령은 canClaimNow
 * - 2회: done（완료）
 */
export function getClaimMenuStatus(
  bucket: ClaimBucket,
  now = Date.now(),
  kind: ClaimKind = 'feed',
): ClaimMenuStatus {
  const b = normalizeBucket(bucket)
  if (b.count >= CLAIM_MAX_PER_DAY) {
    return { kind: 'done' }
  }
  // 1차 수령 후 ~ 2차 전: 항상 타이머 (시계가 0이어도 유지)
  if (b.count >= 1) {
    const remainingMs = Math.max(0, b.nextReadyAt - now)
    const totalMs = kind === 'feed' ? FEED_COOLDOWN_MS : TOY_COOLDOWN_MS
    return {
      kind: 'cooldown',
      remainingMs,
      label: formatClaimCountdown(remainingMs),
      progress: progressTowardReady(remainingMs, totalMs),
    }
  }
  return { kind: 'ready' }
}

/**
 * 수령 가능
 * - 0회: 받기 가능
 * - 1회 후: 타이머 중이어도 한 번 더 받으면 완료
 * - 2회: 불가
 */
export function canClaimNow(bucket: ClaimBucket, _now = Date.now()): boolean {
  const b = normalizeBucket(bucket)
  return b.count < CLAIM_MAX_PER_DAY
}

/** 수령 성공 후 쿨다운·일일 카운트 반영 (사용 게이트 리셋) */
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
      usedSinceClaim: false,
    },
  }
  await savePetClaimState(next)
  return next
}

/** 사료 주기 / 놀아 주기 성공 시 — 2차 수령 게이트 해제 */
export async function recordPetItemUse(
  kind: ClaimKind,
  now = Date.now(),
): Promise<PetClaimState> {
  const state = await loadPetClaimState()
  const bucket = normalizeBucket(state[kind])
  // 사료 사용 직후: 받기 CD가 진행 중이면 2.5h 경과(남은 ≈1.5h)로 맞춤 — 총 4h·링 검수 가시성
  const nextReadyAt =
    kind === 'feed' && bucket.nextReadyAt > now
      ? now + CLAIM_COOLDOWN_MS - CLAIM_COOLDOWN_MS * (2.5 / 4)
      : bucket.nextReadyAt
  if (bucket.usedSinceClaim && nextReadyAt === bucket.nextReadyAt) {
    return state
  }
  const next: PetClaimState = {
    ...state,
    [kind]: { ...bucket, usedSinceClaim: true, nextReadyAt },
  }
  await savePetClaimState(next)
  return next
}

/** 개발/검수 */
export async function resetPetClaimState(): Promise<void> {
  await AsyncStorage.removeItem(KEY)
}
