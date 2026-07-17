import type { ImageSourcePropType } from 'react-native'
import { DogExpr, type DogExprKey } from './DogExpr'

/**
 * 나미 표정 매핑 (사용자 제공 cat-character)
 * 강아지 expr 키와 맞춰 온보딩에서 번갈아 쓰기 쉽게 함
 */
export const CatExpr = {
  fun: require('../assets/images/cat-character_2.png'),
  wink: require('../assets/images/cat-character_2.png'),
  soft: require('../assets/images/cat-character_1.png'),
  tired: require('../assets/images/cat-character_1.png'),
} as const

export type PetSpecies = 'mongi' | 'nami'

/** 화면/슬라이드 순번 → 짝수 몽이, 홀수 나미 */
export function onboardingSpecies(index: number): PetSpecies {
  return index % 2 === 0 ? 'mongi' : 'nami'
}

/** 온보딩 마스코트 — 순번으로 몽이·나미 번갈아 + 표정 */
export function onboardingMascot(
  index: number,
  expr: DogExprKey = 'soft',
): ImageSourcePropType {
  return onboardingSpecies(index) === 'mongi' ? DogExpr[expr] : CatExpr[expr]
}

/** 게이트 등 재진입마다 번갈아 보여줄 때 */
let gateVisit = 0
export function nextGateMascot(expr: DogExprKey = 'fun'): ImageSourcePropType {
  const src = onboardingMascot(gateVisit, expr)
  gateVisit += 1
  return src
}
