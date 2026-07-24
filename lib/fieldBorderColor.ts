import { Colors } from '../constants/Colors'

/**
 * 폼 필드 테두리 상태
 * - 미입력: border
 * - 입력됨: beige
 * - 포커스(활성): selected (브라운 — Primary 코랄 금지)
 * - 오류: error
 * - 비활성: sand
 */
export function fieldBorderColor(opts: {
  error?: boolean
  focused?: boolean
  filled?: boolean
  disabled?: boolean
}): string {
  if (opts.error) return Colors.error
  if (opts.disabled) return Colors.sand
  if (opts.focused) return Colors.selected
  if (opts.filled) return Colors.beige
  return Colors.border
}
