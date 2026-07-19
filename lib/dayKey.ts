/**
 * Calendar day key for daily caps / claim resets.
 * Prefers Asia/Seoul (정책 자정); falls back to device local if Intl fails.
 */
export function dayKey(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}

/** ms until next Asia/Seoul midnight (local fallback if Intl unavailable). */
export function msUntilMidnight(now = Date.now()): number {
  try {
    const today = dayKey(new Date(now))
    const [y, m, d] = today.split('-').map(Number)
    // KST midnight of tomorrow = UTC(y,m-1,d+1) − 9h
    const next = Date.UTC(y, m - 1, d + 1) - 9 * 60 * 60 * 1000
    return Math.max(0, next - now)
  } catch {
    const d = new Date(now)
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    return Math.max(0, next.getTime() - now)
  }
}
