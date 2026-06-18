import { useEffect } from 'react'

interface MetaOptions {
  title: string
  description: string
  canonical?: string
  ogType?: 'website' | 'article'
}

const SITE_NAME = 'TranscriptFlow'
const BASE_URL = 'https://transcriptflow.app'

export function useMeta({ title, description, canonical, ogType = 'website' }: MetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} – ${SITE_NAME}`
    const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL

    document.title = fullTitle

    setMeta('description', description)
    setMeta('robots', 'index, follow')

    // Open Graph
    setOg('og:title', fullTitle)
    setOg('og:description', description)
    setOg('og:url', url)
    setOg('og:type', ogType)
    setOg('og:site_name', SITE_NAME)
    setOg('og:image', `${BASE_URL}/og-image.png`)

    // Twitter / X
    setOg('twitter:card', 'summary_large_image')
    setOg('twitter:title', fullTitle)
    setOg('twitter:description', description)
    setOg('twitter:image', `${BASE_URL}/og-image.png`)

    // Canonical link
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url

    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, canonical, ogType])
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}
