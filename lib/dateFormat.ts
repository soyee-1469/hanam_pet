/**
 * 앱 전역 날짜·시간 표기 (Asia/Seoul, 24시간).
 *
 * - formatDate      → 2026.07.08
 * - formatDateTime  → 2026.07.08 14:20:28
 */
const TZ = 'Asia/Seoul'

type SeoulParts = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function seoulParts(d: Date): SeoulParts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00'

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

/** Date | ISO | `YYYY-MM-DD` | `YYYY-MM-DD HH:mm:ss` */
export function toSeoulDate(input: Date | string | number): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input === 'number') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const s = String(input).trim()
  if (!s) return null

  const storage = s.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  )
  if (storage) {
    const [, y, mo, d, h, mi, se] = storage
    const hh = h ?? '00'
    const mm = mi ?? '00'
    const ss = se ?? '00'
    return new Date(`${y}-${mo}-${d}T${hh}:${mm}:${ss}+09:00`)
  }

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 2026.07.08 */
export function formatDate(input: Date | string | number): string {
  const d = toSeoulDate(input)
  if (!d) return typeof input === 'string' ? input : ''
  const { year, month, day } = seoulParts(d)
  return `${year}.${month}.${day}`
}

/** 2026.07.08 14:20:28 */
export function formatDateTime(input: Date | string | number): string {
  const d = toSeoulDate(input)
  if (!d) return typeof input === 'string' ? input : ''
  const { year, month, day, hour, minute, second } = seoulParts(d)
  return `${year}.${month}.${day} ${hour}:${minute}:${second}`
}

/** 연·월·일 숫자 → 2026.07.08 */
export function formatDateFromYmd(y: number, m: number, d: number): string {
  return `${y}.${pad2(m)}.${pad2(d)}`
}
