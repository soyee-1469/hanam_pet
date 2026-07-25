import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AssessmentId } from '../constants/MindAssessments'
import { formatDate, formatDateTime } from './dateFormat'

const KEY = 'hp_mind_check_results'
const SEED_KEY = `${KEY}_seeded`
const SEED_VERSION = '6'

export type MindCheckResultRecord = {
  id: string
  assessmentId: AssessmentId
  score: number
  max: number
  /** ISO date string */
  at: string
}

/** 디자인 확인용 — 검사·상태(구간)별 1건씩 */
const DEMO_SEEDS: MindCheckResultRecord[] = [
  // 우울 (PHQ) · 0–9 / 10–18 / 19–27 / 28–36
  {
    id: 'demo-phq-normal',
    assessmentId: 'phq',
    score: 5,
    max: 36,
    at: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'demo-phq-mild',
    assessmentId: 'phq',
    score: 14,
    max: 36,
    at: '2026-07-15T10:00:00.000Z',
  },
  {
    id: 'demo-phq-moderate',
    assessmentId: 'phq',
    score: 22,
    max: 36,
    at: '2026-07-10T10:00:00.000Z',
  },
  {
    id: 'demo-phq-severe',
    assessmentId: 'phq',
    score: 30,
    max: 36,
    at: '2026-07-05T10:00:00.000Z',
  },
  // 불안 (GAD) · 0–9 / 10–16 / 17–24 / 25–33
  {
    id: 'demo-gad-normal',
    assessmentId: 'gad',
    score: 4,
    max: 33,
    at: '2026-07-19T10:00:00.000Z',
  },
  {
    id: 'demo-gad-mild',
    assessmentId: 'gad',
    score: 13,
    max: 33,
    at: '2026-07-14T10:00:00.000Z',
  },
  {
    id: 'demo-gad-moderate',
    assessmentId: 'gad',
    score: 20,
    max: 33,
    at: '2026-07-09T10:00:00.000Z',
  },
  {
    id: 'demo-gad-severe',
    assessmentId: 'gad',
    score: 28,
    max: 33,
    at: '2026-07-04T10:00:00.000Z',
  },
  // 스트레스 · 0–10 / 11–20 / 21–33
  {
    id: 'demo-stress-normal',
    assessmentId: 'stress',
    score: 5,
    max: 33,
    at: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'demo-stress-mild',
    assessmentId: 'stress',
    score: 15,
    max: 33,
    at: '2026-07-13T10:00:00.000Z',
  },
  {
    id: 'demo-stress-severe',
    assessmentId: 'stress',
    score: 26,
    max: 33,
    at: '2026-07-08T10:00:00.000Z',
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

function isDemoId(id: string) {
  return id.startsWith('demo-')
}

/** 첫 실행·마이그레이션 시 디자인 확인용 더미를 넣음 */
async function ensureSeed(): Promise<MindCheckResultRecord[]> {
  const list = await readAll()
  const seededFlag = await AsyncStorage.getItem(SEED_KEY)

  if (seededFlag === SEED_VERSION) return list

  // 시드 버전 갱신 시 예전 demo 레코드 교체 (실사용 기록은 유지)
  const kept = list.filter((r) => !isDemoId(r.id))
  const ids = new Set(kept.map((r) => r.id))
  const merged = [...kept]
  for (const demo of DEMO_SEEDS) {
    if (!ids.has(demo.id)) merged.push(demo)
  }

  await writeAll(merged)
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
  return formatDateTime(iso)
}

export function formatResultDateShort(iso: string): string {
  return formatDate(iso)
}

/** @deprecated formatDate 와 동일 */
export function formatResultDateYmd(iso: string): string {
  return formatDate(iso)
}
