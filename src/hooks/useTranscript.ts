import { useState, useEffect } from 'react'
import { fetchTranscript, type TranscriptResponse, type ApiError } from '@/lib/api'

type State =
  | { status: 'loading' }
  | { status: 'success'; data: TranscriptResponse }
  | { status: 'error'; error: ApiError }

export function useTranscript(videoId: string | undefined) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!videoId) return

    let cancelled = false
    setState({ status: 'loading' })

    fetchTranscript(videoId).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setState({ status: 'success', data: result.data })
      } else {
        setState({ status: 'error', error: result.error })
      }
    })

    return () => { cancelled = true }
  }, [videoId])

  return state
}
