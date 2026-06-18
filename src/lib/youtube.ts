/**
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *
 * Video IDs are 11 chars: A-Z a-z 0-9 _ -
 */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)

    // youtu.be short link
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return VIDEO_ID_RE.test(id) ? id : null
    }

    // youtube.com or www.youtube.com
    if (
      url.hostname === 'youtube.com' ||
      url.hostname === 'www.youtube.com'
    ) {
      const id = url.searchParams.get('v')
      return id && VIDEO_ID_RE.test(id) ? id : null
    }

    return null
  } catch {
    // not a valid URL at all
    return null
  }
}

export function isValidYouTubeUrl(input: string): boolean {
  return extractVideoId(input) !== null
}
