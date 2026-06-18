import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export const FREE_LIMIT = 3

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export function useUserUsage() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const month = currentMonth()

  const fetchUsage = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('user_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()
    setCount(data?.count ?? 0)
    setLoading(false)
  }, [user, month])

  useEffect(() => { fetchUsage() }, [fetchUsage])

  async function recordUsage() {
    if (!user) return
    const newCount = count + 1
    await supabase
      .from('user_usage')
      .upsert(
        { user_id: user.id, month, count: newCount },
        { onConflict: 'user_id,month' }
      )
    setCount(newCount)
  }

  return {
    count,
    loading,
    canGenerate: count < FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - count),
    recordUsage,
  }
}
