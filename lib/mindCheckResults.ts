import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AssessmentId } from '../constants/MindAssessments'

const KEY = 'hp_mind_check_results'
const SEED_KEY = `${KEY}_seeded`
const SEED_VERSION = '3'

export type MindCheckResultRecord = {
  id: string
  assessmentId: AssessmentId
  score: number
  max: number
  /** ISO date string */
  at: string
}

const DEMO_SEEDS: MindCheckResultRecord[] = [
  {
    id: 'demo-phq-2025-07-11',
    assessmentId: 'phq',
    score: 20,
    max: 36,
    at: '2025-07-11T12:00:00.000Z',
  },
  {
    id: 'demo-phq-2025-06-20',
    assessmentId: 'phq',
    score: 12,
    max: 36,
    at: '2025-06-20T12:00:00.000Z',
  },
  {
    id: 'demo-phq-2025-05-08',
    assessmentId: 'phq',
    score: 8,
    max: 36,
    at: '2025-05-08T12:00:00.000Z',
  },
  {
    id: 'demo-stress-2025-07-03',
    assessmentId: 'stress',
    score: 12,
    max: 33,
    at: '2025-07-03T12:00:00.000Z',
  },
]

async function readAll(): Promise<MindCheckResultRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MindCheckResultRecord[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

async function writeAll(list: MindCheckResultRecord[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list))
}

/** 첫 실행·마이그레이션 시 디자인 확인용 더미를 넣음 */
async function ensureSeed(): Promise<MindCheckResultRecord[]> {
  const list = await readAll()
  const seededFlag = await AsyncStorage.getItem(SEED_KEY)

  if (seededFlag === SEED_VERSION) return list

  if (seededFlag != null && list.length === 0) {
    await AsyncStorage.setItem(SEED_KEY, SEED_VERSION)
    return list
  }

  const ids = new Set(list.map((r) => r.id))
  const merged = [...list]
  for (const demo of DEMO_SEEDS) {
    if (!ids.has(demo.id)) merged.push(demo)
  }
  if (merged.length === 0) {
    await writeAll(DEMO_SEEDS)
    await AsyncStorage.setItem(SEED_KEY, SEED_VERSION)
    return DEMO_SEEDS
  }
  if (merged.length !== list.length) await writeAll(merged)
  await AsyncStorage.setItem(SEED_KEY, SEED_VERSION)
  return merged
}

export async function getMindCheckResults(
  assessmentId?: AssessmentId,
): Promise<MindCheckResultRecord[]> {
  const list = await ensureSeed()
  const sorted = [...list].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
  if (!assessmentId) return sorted
  return sorted.filter((r) => r.assessmentId === assessmentId)
}

export async function getLatestMindCheckResult(
  assessmentId: AssessmentId = 'phq',
): Promise<MindCheckResultRecord | null> {
  const list = await getMindCheckResults(assessmentId)
  return list[0] ?? null
}

export async function saveMindCheckResult(input: {
  assessmentId: AssessmentId
  score: number
  max: number
}): Promise<MindCheckResultRecord> {
  const list = await readAll()
  const record: MindCheckResultRecord = {
    id: `${input.assessmentId}-${Date.now()}`,
    assessmentId: input.assessmentId,
    score: input.score,
    max: input.max,
    at: new Date().toISOString(),
  }
  await writeAll([record, ...list])
  return record
}

export async function clearMindCheckResults(): Promise<void> {
  await writeAll([])
  await AsyncStorage.setItem(SEED_KEY, SEED_VERSION)
}

export function formatResultDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatResultDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}
