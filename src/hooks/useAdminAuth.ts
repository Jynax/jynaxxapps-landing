import { useState, useCallback, useEffect } from 'react'

const TOKEN_KEY = 'jynaxx-admin-token'

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
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: '{}',
    }).then(res => {
      // If we get 403, token is expired/invalid
      // 400 is fine — means token is valid but body was bad (expected)
      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      }
    }).catch(() => {
      // Network error — keep token, user might be offline
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (password: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('Invalid password')
        return false
      }
      const data = await res.json() as { token: string }
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

  return { token, error, loading, login, logout, isAuthenticated: !!token }
}
