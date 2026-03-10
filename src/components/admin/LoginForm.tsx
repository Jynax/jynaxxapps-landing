import { useState } from 'react'

interface LoginFormProps {
  onLogin: (password: string) => Promise<boolean>
  error: string
  loading: boolean
}

export function LoginForm({ onLogin, error, loading }: LoginFormProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onLogin(password)
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1 className="admin-login-title">JynaxxApps Admin</h1>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="admin-input"
            autoFocus
            disabled={loading}
          />
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="admin-error">{error}</p>}
        </form>
      </div>
    </div>
  )
}
