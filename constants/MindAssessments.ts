/** 마음 살피기 · 평가도구 문항 (더미 — 정식 도구 연결 전) */

export type AssessmentId = 'phq' | 'gad' | 'stress'

export type AssessmentOption = {
  value: number
  label: string
}

export type SeverityId = 'normal' | 'mild' | 'moderate' | 'severe'

export type SeverityBand = {
  id: SeverityId
  label: string
  shortLabel: string
  /** 결과 해석 카드 제목 (예: 경증 수준의 불안장애) */
  displayTitle: string
  min: number
  max: number
  color: string
  meaning: string
  opinionTitle: string
  opinionBody: string
  tips: string[]
}

export type AssessmentDef = {
  id: AssessmentId
  /** 헤더용 짧은 제목 */
  shortTitle: string
  /** 섹션 라벨 (예: 불안 평가도구(NAS)) */
  title: string
  /** 문항 화면 메인 타이틀 (예: 우울 알아보기) */
  exploreTitle: string
  instruction: string
  description: string
  recommends: string[]
  /** 점수 구간 섹션 제목 */
  bandsSectionLabel: string
  options: AssessmentOption[]
  questions: string[]
}

export const ASSESSMENT_OPTIONS: AssessmentOption[] = [
  { value: 0, label: '전혀 그렇지 않다' },
  { value: 1, label: '가끔 그렇다' },
  { value: 2, label: '자주 그렇다' },
  { value: 3, label: '거의 매일 그렇다' },
]

export const ASSESSMENTS: Record<AssessmentId, AssessmentDef> = {
  phq: {
    id: 'phq',
    shortTitle: '우울 평가도구',
    title: '우울 평가도구(NDS)',
    exploreTitle: '우울 알아보기',
    instruction: '지난 2주간의 경험을 떠올려 주세요',
    description:
      '한국판 우울 검사(NDS) 기반의 우울증 선별검사 도구입니다. 현재 우울감을 살펴보고 확인하는 시간을 가져보세요.',
    recommends: [
      '우울감과 관련된 증상이 있는지 확인하고 싶으신 분',
      '전문적인 상담이 필요한지 판단하고 싶으신 분',
      '자신의 정신 건강 상태를 객관적으로 평가하고 싶으신 분',
    ],
    bandsSectionLabel: '결과 해석 방법',
    options: ASSESSMENT_OPTIONS,
    questions: [
      '기분이 가라앉거나 우울한 느낌이 든다',
      '평소 하던 일에 흥미나 즐거움이 없다',
      '잠들기 어렵거나 자주 깬다',
      '마음 속에서 뭔가 치밀어 오르는 것 같다',
      '쉽게 피곤하거나 기운이 없다',
      '식욕이 줄거나 늘었다',
      '내가 실패했다고 느끼거나 자신을 탓한다',
      '일에 집중하기가 어렵다',
      '말이나 행동이 느려진 느낌이 든다',
      '차라리 죽는 게 낫겠다는 생각이 든다',
      '미래에 대한 희망이 잘 느껴지지 않는다',
      '사람들과 어울리는 것이 부담스럽다',
    ],
  },
  gad: {
    id: 'gad',
    shortTitle: '불안 평가도구',
    title: '불안 평가도구(NAS)',
    exploreTitle: '불안 알아보기',
    instruction: '지난 2주간의 경험을 떠올려 주세요',
    description:
      '한국판 불안 검사(NAS) 기반의 불안도 평가 도구입니다. 현재 나의 불안 수준을 스스로 면밀하게 점검하고 확인하는 시간을 가져보세요.',
    recommends: [
      '불안감과 관련된 증상이 있는지 확인하고 싶으신 분',
      '전문적인 상담이 필요한지 판단하고 싶으신 분',
      '자신의 정신 건강 상태를 객관적으로 평가하고 싶으신 분',
    ],
    bandsSectionLabel: '결과 해석 방법',
    options: ASSESSMENT_OPTIONS,
    questions: [
      '초조하거나 불안하거나 조마조마하다',
      '걱정이 멈추지 않는다',
      '여러 가지 걱정 때문에 편하게 있기가 어렵다',
      '편하게 긴장을 풀기가 어렵다',
      '너무 안절부절못해서 가만히 있기가 힘들다',
      '쉽게 짜증이 나거나 과민해진다',
      '끔찍한 일이 일어날 것 같은 두려움을 느낀다',
      '심장 두근거림이나 숨이 차는 느낌이 든다',
      '집중력이 떨어진다',
      '수면에 방해를 받는다',
      '몸이 긴장되거나 굳는 느낌이 든다',
    ],
  },
  stress: {
    id: 'stress',
    shortTitle: '스트레스 평가도구',
    title: '스트레스 평가도구(NSS)',
    exploreTitle: '스트레스 알아보기',
    instruction: '요즘 느끼는 부담을 떠올려 주세요',
    description:
      '한국판 스트레스 검사(NSS) 기반의 스트레스 수준 평가 도구입니다. 일상생활에서 받는 스트레스가 얼마나 쌓여 있는지 확인해보세요.',
    recommends: [
      '스트레스와 관련된 증상이 있는지 확인하고 싶으신 분',
      '전문적인 상담이 필요한지 판단하고 싶으신 분',
      '자신의 정신 건강 상태를 객관적으로 평가하고 싶으신 분',
    ],
    bandsSectionLabel: '점수 구간별 의미',
    options: ASSESSMENT_OPTIONS,
    questions: [
      '해야 할 일이 너무 많다고 느낀다',
      '여유가 없어 숨이 막히는 느낌이다',
      '작은 일에도 예민하게 반응한다',
      '몸과 마음이 늘 긴장되어 있다',
      '쉬는 시간에도 마음이 편하지 않다',
      '결정을 내리는 것이 부담스럽다',
      '주변 사람에게 짜증을 부리게 된다',
      '두통·어깨 결림 등 몸이 불편하다',
      '집중이 잘 되지 않는다',
      '미래에 대한 걱정이 끊이지 않는다',
      '혼자만의 시간이 부족하다',
    ],
  },
}

export function getAssessment(id: string | undefined): AssessmentDef | null {
  if (!id) return null
  if (id in ASSESSMENTS) return ASSESSMENTS[id as AssessmentId]
  return null
}

export function assessmentMaxScore(assessment: AssessmentDef): number {
  return assessment.questions.length * 3
}

/** NDS 0–36 (결과 화면: 0–9 / 10–18 / 19–27 / 28–36) */
export const DEPRESSION_BANDS: SeverityBand[] = [
  {
    id: 'normal',
    label: '정상',
    shortLabel: '정상 수준',
    displayTitle: '정상',
    min: 0,
    max: 9,
    color: '#A9B69A',
    meaning: '일상에 지장이 적은 안정적인 상태',
    opinionTitle: '정상 (0-9점) 전문가 소견',
    opinionBody:
      '지난 2주간 우울 관련 증상이 거의 없거나 매우 가벼운 편이에요. 지금의 리듬을 잘 유지해 보세요.',
    tips: [
      '규칙적인 수면·식사 리듬을 이어가 보세요.',
      '가벼운 산책이나 취미로 기분을 돌봐 주세요.',
      '변화가 느껴지면 언제든 다시 체크해 보세요.',
    ],
  },
  {
    id: 'mild',
    label: '경도',
    shortLabel: '경도 수준',
    displayTitle: '경증 수준의 우울장애',
    min: 10,
    max: 18,
    color: '#D4E08A',
    meaning: '가벼운 우울감, 셀프케어와 관찰 권장',
    opinionTitle: '경도 (10-18점) 전문가 소견',
    opinionBody:
      '지난 2주간 가벼운 우울 느낌이 있었을 수 있어요. 일상은 유지되지만, 마음을 조금 더 살펴보면 좋아요.',
    tips: [
      '수면·식사 등 생활 리듬을 점검해 보세요.',
      '믿을 수 있는 사람에게 마음을 나눠 보세요.',
      '증상이 이어지면 상담을 고려해 보세요.',
    ],
  },
  {
    id: 'moderate',
    label: '중등도',
    shortLabel: '중등도 수준',
    displayTitle: '중등도 수준의 우울장애',
    min: 19,
    max: 27,
    color: '#E8A07A',
    meaning: '일상 기능 저하, 전문 상담 권장',
    opinionTitle: '중등도 (19-27점) 전문가 소견',
    opinionBody:
      '지난 2주간 중등도 수준의 우울 느낌이 지속된 것으로 보여요. 의욕 저하·수면 변화 등으로 일상 기능에 영향을 줄 수 있어 적극적인 관리가 필요한 단계예요.',
    tips: [
      '규칙적인 수면·식사 등 생활 리듬을 회복해 보세요.',
      '믿을 수 있는 사람에게 마음을 나눠 보세요.',
      '2주 이상 지속되면 정신건강의학과·상담센터 방문을 권해요.',
    ],
  },
  {
    id: 'severe',
    label: '중증',
    shortLabel: '중증 수준',
    displayTitle: '중증 수준의 우울장애',
    min: 28,
    max: 36,
    color: '#E57A72',
    meaning: '즉각적인 전문 치료와 개입 필요',
    opinionTitle: '중증 (28-36점) 전문가 소견',
    opinionBody:
      '높은 수준의 우울 관련 증상이 보여요. 혼자 견디기보다 전문 기관의 도움을 빠르게 받는 것이 중요해요.',
    tips: [
      '정신건강의학과 또는 상담센터에 바로 연락해 보세요.',
      '위급하면 109·1577-0199 등 긴급 상담을 이용해 주세요.',
      '가까운 사람과 함께 도움을 요청해 보세요.',
    ],
  },
]

/** NAS 0–33 (11문항 × 3점) */
export const ANXIETY_BANDS: SeverityBand[] = [
  {
    id: 'normal',
    label: '정상',
    shortLabel: '정상 수준',
    displayTitle: '정상',
    min: 0,
    max: 9,
    color: '#A9B69A',
    meaning: '일상에 지장이 적은 안정적인 상태',
    opinionTitle: '정상 (0-9점) 전문가 소견',
    opinionBody:
      '지난 2주간 불안 관련 증상이 거의 없거나 매우 가벼운 편이에요. 지금의 리듬을 잘 유지해 보세요.',
    tips: [
      '규칙적인 수면·호흡 리듬을 이어가 보세요.',
      '가벼운 스트레칭이나 산책으로 긴장을 풀어 주세요.',
      '변화가 느껴지면 언제든 다시 체크해 보세요.',
    ],
  },
  {
    id: 'mild',
    label: '경증',
    shortLabel: '경증 수준',
    displayTitle: '경증 수준의 불안장애',
    min: 10,
    max: 16,
    color: '#D4E08A',
    meaning: '가벼운 불안감, 셀프케어와 관찰 권장',
    opinionTitle: '경증 (10-16점) 전문가 소견',
    opinionBody:
      '지난 2주간 가벼운 불안감이 있었을 수 있어요. 일상은 유지되지만, 긴장을 조금 더 살펴보면 좋아요.',
    tips: [
      '걱정이 커질 때 짧게 호흡을 고르는 연습을 해보세요.',
      '믿을 수 있는 사람에게 마음을 나눠 보세요.',
      '증상이 이어지면 상담을 고려해 보세요.',
    ],
  },
  {
    id: 'moderate',
    label: '중등도',
    shortLabel: '중등도 수준',
    displayTitle: '중등도 수준의 불안장애',
    min: 17,
    max: 24,
    color: '#E8A07A',
    meaning: '일상 기능 저하, 전문 상담 권장',
    opinionTitle: '중등도 (17-24점) 전문가 소견',
    opinionBody:
      '지난 2주간 중등도 수준의 불안이 지속된 것으로 보여요. 긴장·걱정으로 일상 기능에 영향을 줄 수 있어 적극적인 관리가 필요한 단계예요.',
    tips: [
      '수면·식사 등 생활 리듬을 회복해 보세요.',
      '믿을 수 있는 사람에게 마음을 나눠 보세요.',
      '2주 이상 지속되면 정신건강의학과·상담센터 방문을 권해요.',
    ],
  },
  {
    id: 'severe',
    label: '중증',
    shortLabel: '중증 수준',
    displayTitle: '중증 수준의 불안장애',
    min: 25,
    max: 33,
    color: '#E57A72',
    meaning: '즉각적인 전문 치료와 개입 필요',
    opinionTitle: '중증 (25-33점) 전문가 소견',
    opinionBody:
      '높은 수준의 불안 관련 증상이 보여요. 혼자 견디기보다 전문 기관의 도움을 빠르게 받는 것이 중요해요.',
    tips: [
      '정신건강의학과 또는 상담센터에 바로 연락해 보세요.',
      '위급하면 109·1577-0199 등 긴급 상담을 이용해 주세요.',
      '가까운 사람과 함께 도움을 요청해 보세요.',
    ],
  },
]

/** NSS 0–33 (11문항 × 3점) — 3구간 */
export const STRESS_BANDS: SeverityBand[] = [
  {
    id: 'normal',
    label: '낮음',
    shortLabel: '낮은 수준',
    displayTitle: '낮은 수준의 스트레스',
    min: 0,
    max: 10,
    color: '#A9B69A',
    meaning: '대처 능력이 우수하며 안정적인 상태',
    opinionTitle: '낮은 수준 (0-10점) 전문가 소견',
    opinionBody:
      '스트레스에 잘 대처하고 있는 편이에요. 지금의 리듬과 회복 방법을 잘 유지해 보세요.',
    tips: [
      '규칙적인 휴식과 수면 리듬을 이어가 보세요.',
      '가벼운 산책이나 취미로 긴장을 풀어 주세요.',
      '부담이 커지면 언제든 다시 체크해 보세요.',
    ],
  },
  {
    id: 'mild',
    label: '중등도',
    shortLabel: '경도 수준',
    displayTitle: '중등도 이상의 스트레스',
    min: 11,
    max: 20,
    color: '#F4C85B',
    meaning: '지속적인 주의와 점진적 해소 방법 필요',
    opinionTitle: '중등도 이상 (11-20점) 전문가 소견',
    opinionBody:
      '스트레스가 쌓여 주의가 필요한 단계예요. 원인을 조금씩 정리하고, 회복 루틴을 늘려보면 좋아요.',
    tips: [
      '할 일을 나눠 우선순위를 정해 보세요.',
      '짧은 휴식·호흡으로 긴장을 자주 풀어 주세요.',
      '증상이 이어지면 상담을 고려해 보세요.',
    ],
  },
  {
    id: 'severe',
    label: '중증',
    shortLabel: '중증 수준',
    displayTitle: '매우 높은 중증 스트레스',
    min: 21,
    max: 33,
    color: '#E57A72',
    meaning: '적극적인 원인 파악 및 전문적 도움 권장',
    opinionTitle: '매우 높은 중증 (21-33점) 전문가 소견',
    opinionBody:
      '스트레스 수준이 매우 높은 편이에요. 혼자 견디기보다 원인 파악과 전문 기관의 도움을 빠르게 받는 것이 중요해요.',
    tips: [
      '정신건강의학과 또는 상담센터에 연락해 보세요.',
      '위급하면 109·1577-0199 등 긴급 상담을 이용해 주세요.',
      '가까운 사람과 함께 도움을 요청해 보세요.',
    ],
  },
]

/** @deprecated getSeverityBands('phq') 사용 */
export const SEVERITY_BANDS = DEPRESSION_BANDS

export function getSeverityBands(
  assessmentId: AssessmentId | string | undefined,
): SeverityBand[] {
  if (assessmentId === 'gad') return ANXIETY_BANDS
  if (assessmentId === 'stress') return STRESS_BANDS
  return DEPRESSION_BANDS
}

export function getSeverityBand(
  score: number,
  assessmentId?: AssessmentId | string,
): SeverityBand {
  const bands = getSeverityBands(assessmentId)
  const max = bands[bands.length - 1]?.max ?? 36
  const clamped = Math.max(0, Math.min(max, score))
  return (
    bands.find((b) => clamped >= b.min && clamped <= b.max) ?? bands[0]
  )
}

export function resultTitle(assessmentId: AssessmentId | string | undefined) {
  if (assessmentId === 'gad') return '불안 평가 결과'
  if (assessmentId === 'stress') return '스트레스 평가 결과'
  return '우울 평가 결과'
}

/** 결과 상단 상태 라벨 */
export function statusLabel(assessmentId: AssessmentId | string | undefined) {
  if (assessmentId === 'gad') return '현재 불안 상태'
  if (assessmentId === 'stress') return '현재 스트레스 상태'
  return '현재 우울 상태'
}
