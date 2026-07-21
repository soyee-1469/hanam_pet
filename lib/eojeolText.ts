/**
 * 한글 줄바꿈을 음절(글자)이 아니라 어절(띄어쓰기) 단위로 유도한다.
 * 어절 내부 글자 사이에 WORD JOINER(U+2060)를 넣어 중간 개행을 막는다.
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
