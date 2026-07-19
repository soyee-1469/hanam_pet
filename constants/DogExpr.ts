/**
 * 몽이 표정 에셋 (사용자 제공)
 * - fun: 신남/환영
 * - wink: 다정한 윙크
 * - soft: 기본 캐릭터 (dog-character)
 * - tired: 피곤·쉼
 */
export const DogExpr = {
  fun: require('../assets/images/dog-expr-fun.png'),
  wink: require('../assets/images/dog-expr-wink.png'),
  soft: require('../assets/images/dog-character.png'),
  tired: require('../assets/images/dog-expr-tired.png'),
} as const

export type DogExprKey = keyof typeof DogExpr
