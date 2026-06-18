import type { VercelResponse } from '@vercel/node'

export type ApiErrorCode =
  | 'INVALID_VIDEO_ID'
  | 'NO_TRANSCRIPT'
  | 'VIDEO_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'METHOD_NOT_ALLOWED'

const STATUS_MAP: Record<ApiErrorCode, number> = {
  INVALID_VIDEO_ID: 400,
  NO_TRANSCRIPT: 404,
  VIDEO_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  METHOD_NOT_ALLOWED: 405,
}

export function sendError(
  res: VercelResponse,
  code: ApiErrorCode,
  message: string
) {
  res.status(STATUS_MAP[code]).json({ error: { code, message } })
}

// FIX #4: CORS headers set in the handler so they apply in vercel dev too
export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
