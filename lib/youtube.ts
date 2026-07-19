/** YouTube URL / 썸네일에서 video id 추출 */

const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

export function extractYoutubeVideoId(
  ...candidates: (string | undefined | null)[]
): string | null {
  for (const raw of candidates) {
    if (!raw) continue
    const id = extractFromOne(raw.trim())
    if (id) return id
  }
  return null
}

function extractFromOne(input: string): string | null {
  // i.ytimg.com/vi/VIDEO_ID/...
  const thumb = input.match(
    /(?:i\.ytimg\.com|img\.youtube\.com)\/vi\/([a-zA-Z0-9_-]{11})\b/,
  )
  if (thumb?.[1]) return thumb[1]

  try {
    const withProto = /^https?:\/\//i.test(input) ? input : `https://${input}`
    const url = new URL(withProto)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return isVideoId(id) ? id : null
    }
    if (YT_HOSTS.has(url.hostname) || host === 'youtube.com') {
      const v = url.searchParams.get('v')
      if (isVideoId(v)) return v
      const embed = url.pathname.match(
        /\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})\b/,
      )
      if (embed?.[1]) return embed[1]
    }
  } catch {
    // fall through
  }

  const loose = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})\b/,
  )
  return loose?.[1] ?? null
}

function isVideoId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(value)
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
