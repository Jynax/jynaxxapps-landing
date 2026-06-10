import { useState, useEffect, useCallback } from 'react'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { LoginForm } from '../components/admin/LoginForm'
import { HeroEditor } from '../components/admin/HeroEditor'
import { ProjectEditor } from '../components/admin/ProjectEditor'
import { AboutEditor } from '../components/admin/AboutEditor'
import { FooterEditor } from '../components/admin/FooterEditor'

export function Admin() {
  const { token, error, loading, loginWithGoogle, logout, isAuthenticated } = useAdminAuth()
  const [content, setContent] = useState<SiteContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [dirty, setDirty] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Load current content from API
  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/content')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then((data: SiteContent) => setContent(data))
      .catch(() => {
        setContent(defaultContent)
        setFetchError('Could not load from API — editing defaults')
      })
  }, [isAuthenticated])

  const updateContent = useCallback(<K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => {
    setContent(prev => prev ? { ...prev, [key]: value } : prev)
    setDirty(true)
    setSaveMsg('')
  }, [])

  const save = async () => {
    if (!content || !token) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      })
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setSaveMsg('Session expired — please log in again')
          // Delay logout so the message is visible before the panel unmounts.
          setTimeout(logout, 1500)
          return
        }
        throw new Error('Save failed')
      }
      setSaveMsg('Saved! Changes are live.')
      setDirty(false)
    } catch {
      setSaveMsg('Failed to save — try again')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={loginWithGoogle} error={error} loading={loading} />
  }

  if (!content) {
    return (
      <div className="admin-loading">
        <p>{fetchError || 'Loading content...'}</p>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Content Editor</h1>
          <a href="#/" className="admin-back">View site</a>
        </div>
        <div className="admin-header-right">
          {saveMsg && (
            <span className={`admin-save-msg ${saveMsg.includes('live') ? 'admin-save-msg--ok' : 'admin-save-msg--err'}`}>
              {saveMsg}
            </span>
          )}
          <button
            className="admin-btn admin-btn--primary"
            onClick={save}
            disabled={saving || !dirty}
          >
            {saving ? 'Saving...' : dirty ? 'Save changes' : 'No changes'}
          </button>
          <button className="admin-btn admin-btn--ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {fetchError && <p className="admin-warning">{fetchError}</p>}

      <div className="admin-sections">
        <HeroEditor hero={content.hero} onChange={v => updateContent('hero', v)} />
        <ProjectEditor projects={content.projects} onChange={v => updateContent('projects', v)} />
        <AboutEditor about={content.about} onChange={v => updateContent('about', v)} />
        <FooterEditor footer={content.footer} onChange={v => updateContent('footer', v)} />
      </div>
    </div>
  )
}
