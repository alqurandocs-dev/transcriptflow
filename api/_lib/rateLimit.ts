import { kv } from '@vercel/kv'
import type { VercelRequest } from '@vercel/node'

export const FREE_LIMIT = 3

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string') return fwd.split(',')[0].trim()
  if (Array.isArray(fwd)) return fwd[0].split(',')[0].trim()
  return (req.socket as { remoteAddress?: string })?.remoteAddress ?? 'unknown'
}

function makeKey(ip: string): string {
  return `rl:${ip}:${currentMonth()}`
}

function kvAvailable(): boolean {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN
}

/** Returns true if the IP is allowed to generate a transcript */
export async function checkLimit(req: VercelRequest): Promise<{ allowed: boolean; remaining: number; ip: string }> {
  if (!kvAvailable()) return { allowed: true, remaining: FREE_LIMIT, ip: 'unknown' }

  const ip = getClientIp(req)
  const key = makeKey(ip)
  const count = (await kv.get<number>(key)) ?? 0
  const remaining = Math.max(0, FREE_LIMIT - count)
  return { allowed: count < FREE_LIMIT, remaining, ip }
}

/** Call after a successful transcript fetch to record usage */
export async function recordUsage(req: VercelRequest): Promise<void> {
  if (!kvAvailable()) return

  const ip = getClientIp(req)
  const key = makeKey(ip)
  const newCount = await kv.incr(key)
  if (newCount === 1) {
    // First use this month — expire after 35 days
    await kv.expire(key, 35 * 24 * 60 * 60)
  }
}
