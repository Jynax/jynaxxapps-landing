import type { SiteContent, SocialLink } from '../../types/content'

interface FooterEditorProps {
  footer: SiteContent['footer']
  onChange: (footer: SiteContent['footer']) => void
}

export function FooterEditor({ footer, onChange }: FooterEditorProps) {
  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    const next = [...footer.links]
    next[index] = { ...next[index], ...updates }
    onChange({ ...footer, links: next })
  }

  const addLink = () => {
    onChange({
      ...footer,
      links: [...footer.links, { platform: '', url: '', label: '' }],
    })
  }

  const removeLink = (index: number) => {
    onChange({
      ...footer,
      links: footer.links.filter((_, i) => i !== index),
    })
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-legend">Footer</legend>

      <label className="admin-label">
        Footer Note (HTML supported)
        <textarea
          className="admin-textarea"
          value={footer.note}
          onChange={e => onChange({ ...footer, note: e.target.value })}
          rows={2}
        />
      </label>

      <h4 className="admin-sub-heading">Social Links</h4>
      {footer.links.map((link, i) => (
        <div key={i} className="admin-link-row">
          <input
            type="text"
            className="admin-input admin-input--sm"
            value={link.label}
            onChange={e => updateLink(i, { label: e.target.value })}
            placeholder="Label"
          />
          <input
            type="text"
            className="admin-input admin-input--sm"
            value={link.platform}
            onChange={e => updateLink(i, { platform: e.target.value })}
            placeholder="Platform"
          />
          <input
            type="text"
            className="admin-input"
            value={link.url}
            onChange={e => updateLink(i, { url: e.target.value })}
            placeholder="URL"
          />
          <button
            type="button"
            className="admin-btn-icon admin-btn-icon--danger"
            onClick={() => removeLink(i)}
            title="Remove link"
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--secondary" onClick={addLink}>
        + Add link
      </button>
    </fieldset>
  )
}
