const KEY = 'tf_usage'
export const FREE_LIMIT = 3

interface UsageData {
  month: string
  count: number
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

function read(): UsageData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { month: currentMonth(), count: 0 }
    const data = JSON.parse(raw) as UsageData
    if (data.month !== currentMonth()) return { month: currentMonth(), count: 0 }
    return data
  } catch {
    return { month: currentMonth(), count: 0 }
  }
}

export function getUsageCount(): number {
  return read().count
}

export function canGenerate(): boolean {
  return read().count < FREE_LIMIT
}

export function recordUsage(): void {
  const d = read()
  localStorage.setItem(KEY, JSON.stringify({ month: d.month, count: d.count + 1 }))
}
