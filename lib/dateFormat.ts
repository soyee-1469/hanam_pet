/**
 * 앱 전역 날짜·시간 표기 (Asia/Seoul, 24시간).
 *
 * - formatDate      → 2026.07.08
 * - formatDateTime  → 2026.07.08 14:20:28
 * - formatDateTimeWithWeekday → 2026.07.08 (수) 14:20:28
 * - formatMonthDayTimeWithWeekday → 07.08 (수) 14:20:28
 * - formatTime      → 14:20:28
 * - formatDateFromYmd → 2026.07.08
 * - formatDateFromYmdWithWeekday → 2026.07.08 화요일
 */const TZ = 'Asia/Seoul'

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

/** 2026.07.08 (수) 14:20:28 */
export function formatDateTimeWithWeekday(
  input: Date | string | number,
): string {
  const d = toSeoulDate(input)
  if (!d) return typeof input === 'string' ? input : ''
  const { year, month, day, hour, minute, second } = seoulParts(d)
  const weekday = seoulWeekdayShort(d)
  return `${year}.${month}.${day} (${weekday}) ${hour}:${minute}:${second}`
}

/** 07.08 (수) 14:20:28 — 연·월로 묶인 리스트용 */
export function formatMonthDayTimeWithWeekday(
  input: Date | string | number,
): string {
  const d = toSeoulDate(input)
  if (!d) return typeof input === 'string' ? input : ''
  const { month, day, hour, minute, second } = seoulParts(d)
  const weekday = seoulWeekdayShort(d)
  return `${month}.${day} (${weekday}) ${hour}:${minute}:${second}`
}

function seoulWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: TZ,
    weekday: 'short',
  }).format(d)
}

/** 화요일 */
function seoulWeekdayLong(d: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: TZ,
    weekday: 'long',
  }).format(d)
}

/** 14:20:28 (날짜는 이미 묶여 있을 때) */
export function formatTime(input: Date | string | number): string {
  const d = toSeoulDate(input)
  if (!d) return typeof input === 'string' ? input : ''
  const { hour, minute, second } = seoulParts(d)
  return `${hour}:${minute}:${second}`
}

/** 연·월 → 2026년 7월 */
export function formatYearMonth(y: number, m: number): string {
  return `${y}년 ${m}월`
}

/** 연·월·일 숫자 → 2026.07.08 */
export function formatDateFromYmd(y: number, m: number, d: number): string {
  return `${y}.${pad2(m)}.${pad2(d)}`
}

/** 연·월·일 숫자 → 2026.07.08 화요일 */
export function formatDateFromYmdWithWeekday(
  y: number,
  m: number,
  d: number,
): string {
  const date = new Date(`${y}-${pad2(m)}-${pad2(d)}T12:00:00+09:00`)
  if (Number.isNaN(date.getTime())) return formatDateFromYmd(y, m, d)
  return `${formatDateFromYmd(y, m, d)} ${seoulWeekdayLong(date)}`
}
