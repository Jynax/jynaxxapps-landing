import { useState, useEffect } from 'react'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'

export function useContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch content')
        return res.json()
      })
      .then((data: SiteContent) => {
        setContent(data)
      })
      .catch(() => {
        // Fall back to defaults silently — content will work either way
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { content, loading }
}
