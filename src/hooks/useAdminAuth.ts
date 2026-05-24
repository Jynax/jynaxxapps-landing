import { useState, useCallback, useEffect } from 'react'

const TOKEN_KEY = 'jynaxx-admin-token'
const GOOGLE_CLIENT_ID = '531901990100-bsroul9si6nd9c7kdml9g3p9idfbm58m.apps.googleusercontent.com'

export { GOOGLE_CLIENT_ID }

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validate stored token on mount
  useEffect(() => {
    if (!token) return
    fetch('/api/content', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      }
    }).catch(() => {
      // Network error — keep token, user might be offline
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loginWithGoogle = useCallback(async (credential: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      if (res.status === 403) {
        setError('This Google account is not authorized')
        return false
      }
      if (!res.ok) {
        setError('Sign-in failed — try again')
        return false
      }
      const data = await res.json() as { token: string; email: string }
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      return true
    } catch {
      setError('Connection failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return { token, error, loading, loginWithGoogle, logout, isAuthenticated: !!token }
}
