import type { SiteContent } from '../../types/content'

interface HeroEditorProps {
  hero: SiteContent['hero']
  onChange: (hero: SiteContent['hero']) => void
}

export function HeroEditor({ hero, onChange }: HeroEditorProps) {
  const update = (field: keyof SiteContent['hero'], value: string) => {
    onChange({ ...hero, [field]: value })
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-legend">Hero</legend>
      <label className="admin-label">
        Title
        <input
          type="text"
          className="admin-input"
          value={hero.title}
          onChange={e => update('title', e.target.value)}
        />
      </label>
      <label className="admin-label">
        Subtitle
        <input
          type="text"
          className="admin-input"
          value={hero.subtitle}
          onChange={e => update('subtitle', e.target.value)}
        />
      </label>
      <label className="admin-label">
        Tagline
        <textarea
          className="admin-textarea"
          value={hero.tagline}
          onChange={e => update('tagline', e.target.value)}
          rows={3}
        />
      </label>
    </fieldset>
  )
}
