/**
 * 입력 필드 키패드 구분.
 * - 글자 → 기본 문자 키패드
 * - 숫자 → number-pad (OTP·코드 등)
 *
 * `inputMode`는 웹(모바일 브라우저)용.
 */
export const TextKeyboardProps = {
  keyboardType: 'default' as const,
  inputMode: 'text' as const,
}

export const NumberKeyboardProps = {
  keyboardType: 'number-pad' as const,
  inputMode: 'numeric' as const,
}
