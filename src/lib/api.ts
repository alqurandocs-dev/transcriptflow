export interface TranscriptSegment {
  text: string
  offset: number   // milliseconds from start
  duration: number
}

export interface TranscriptResponse {
  title: string
  channel: string
  thumbnail: string
  transcript: TranscriptSegment[]
}

export interface ApiError {
  code:
    | 'INVALID_VIDEO_ID'
    | 'NO_TRANSCRIPT'
    | 'VIDEO_NOT_FOUND'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR'
    | 'METHOD_NOT_ALLOWED'
    | 'NETWORK_ERROR'
  message: string
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

export async function fetchTranscript(
  videoId: string
): Promise<ApiResult<TranscriptResponse>> {
  try {
    const res = await fetch(`/api/transcript/${encodeURIComponent(videoId)}`)
    const body = await res.json()

    if (!res.ok) {
      return {
        ok: false,
        error: body.error as ApiError,
      }
    }

    return { ok: true, data: body as TranscriptResponse }
  } catch {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server. Check your connection and try again.',
      },
    }
  }
}
