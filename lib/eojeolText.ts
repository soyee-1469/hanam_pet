import type { TextStyle } from 'react-native'

/**
 * 웹 Text / RN Web 스타일 — 어절 단위 줄바꿈.
 * (전역 CSS `html { word-break: keep-all }`와 동일한 의도)
 */
export const eojeolTextStyle = {
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
} as TextStyle

/**
 * 한글 줄바꿈을 음절(글자)이 아니라 어절(띄어쓰기) 단위로 유도한다.
 * 어절 내부 글자 사이에 WORD JOINER(U+2060)를 넣어 중간 개행을 막는다.
 * 네이티브·웹 공통 보강용 (웹은 전역 CSS만으로도 대부분 충분).
 */
export function eojeolWrap(text: string): string {
  if (!text) return text
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token)) return token
      return Array.from(token).join('\u2060')
    })
    .join('')
}
