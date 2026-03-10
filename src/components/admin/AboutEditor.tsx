import type { SiteContent } from '../../types/content'

interface AboutEditorProps {
  about: SiteContent['about']
  onChange: (about: SiteContent['about']) => void
}

export function AboutEditor({ about, onChange }: AboutEditorProps) {
  const updateParagraph = (index: number, value: string) => {
    const next = [...about.paragraphs]
    next[index] = value
    onChange({ paragraphs: next })
  }

  const addParagraph = () => {
    onChange({ paragraphs: [...about.paragraphs, ''] })
  }

  const removeParagraph = (index: number) => {
    onChange({ paragraphs: about.paragraphs.filter((_, i) => i !== index) })
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-legend">About</legend>
      <p className="admin-hint">HTML is supported (links, bold, etc.)</p>
      {about.paragraphs.map((p, i) => (
        <div key={i} className="admin-paragraph-row">
          <textarea
            className="admin-textarea"
            value={p}
            onChange={e => updateParagraph(i, e.target.value)}
            rows={3}
          />
          {about.paragraphs.length > 1 && (
            <button
              type="button"
              className="admin-btn-icon admin-btn-icon--danger"
              onClick={() => removeParagraph(i)}
              title="Remove paragraph"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--secondary" onClick={addParagraph}>
        + Add paragraph
      </button>
    </fieldset>
  )
}
