import { useEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '../../hooks/useAdminAuth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string
              size?: string
              width?: number
              text?: string
              shape?: string
            }
          ) => void
        }
      }
    }
  }
}

interface LoginFormProps {
  onLogin: (credential: string) => Promise<boolean>
  error: string
  loading: boolean
}

export function LoginForm({ onLogin, error, loading }: LoginFormProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          onLogin(response.credential)
        },
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 300,
        text: 'signin_with',
        shape: 'rectangular',
      })
    }

    // Check if script is already loaded
    if (window.google) {
      initGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
  }, [onLogin])

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1 className="admin-login-title">JynaxxApps Admin</h1>
        <div className="admin-google-btn-wrapper">
          <div ref={buttonRef} />
          {loading && <p className="admin-login-status">Verifying...</p>}
        </div>
        {error && <p className="admin-error">{error}</p>}
      </div>
    </div>
  )
}
