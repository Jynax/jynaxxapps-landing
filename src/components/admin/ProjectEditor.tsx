import { useState } from 'react'
import type { ProjectContent } from '../../types/content'

interface ProjectEditorProps {
  projects: ProjectContent[]
  onChange: (projects: ProjectContent[]) => void
}

export function ProjectEditor({ projects, onChange }: ProjectEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const updateProject = (index: number, updates: Partial<ProjectContent>) => {
    const next = [...projects]
    next[index] = { ...next[index], ...updates }
    onChange(next)
  }

  const moveProject = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= projects.length) return
    const next = [...projects]
    ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
    onChange(next)
  }

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index))
  }

  const addProject = () => {
    const id = `project-${Date.now()}`
    onChange([
      ...projects,
      {
        id,
        name: 'New Project',
        tagline: '',
        description: '',
        url: '',
        aiTools: [],
        status: 'coming-soon',
        statusLabel: 'Coming Soon',
        visible: false,
      },
    ])
    setExpandedId(id)
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-legend">Projects</legend>
      <div className="admin-project-list">
        {projects.map((project, i) => {
          const isExpanded = expandedId === project.id
          return (
            <div key={project.id} className="admin-project-item">
              <div className="admin-project-header" onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                <div className="admin-project-header-left">
                  <span className={`admin-visibility-dot ${project.visible ? 'admin-visibility-dot--visible' : ''}`} />
                  <span className="admin-project-name">{project.name}</span>
                  <span className="admin-project-status">{project.statusLabel}</span>
                </div>
                <div className="admin-project-header-right">
                  <button
                    type="button"
                    className="admin-btn-icon"
                    onClick={e => { e.stopPropagation(); moveProject(i, -1) }}
                    disabled={i === 0}
                    title="Move up"
                  >
                    &#x25B2;
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon"
                    onClick={e => { e.stopPropagation(); moveProject(i, 1) }}
                    disabled={i === projects.length - 1}
                    title="Move down"
                  >
                    &#x25BC;
                  </button>
                  <span className="admin-chevron">{isExpanded ? '\u25B4' : '\u25BE'}</span>
                </div>
              </div>
              {isExpanded && (
                <div className="admin-project-fields">
                  <label className="admin-label">
                    <span className="admin-label-row">
                      Visible
                      <input
                        type="checkbox"
                        checked={project.visible}
                        onChange={e => updateProject(i, { visible: e.target.checked })}
                        className="admin-checkbox"
                      />
                    </span>
                  </label>
                  <label className="admin-label">
                    Name
                    <input
                      type="text"
                      className="admin-input"
                      value={project.name}
                      onChange={e => updateProject(i, { name: e.target.value })}
                    />
                  </label>
                  <label className="admin-label">
                    Tagline
                    <input
                      type="text"
                      className="admin-input"
                      value={project.tagline}
                      onChange={e => updateProject(i, { tagline: e.target.value })}
                    />
                  </label>
                  <label className="admin-label">
                    Description
                    <textarea
                      className="admin-textarea"
                      value={project.description}
                      onChange={e => updateProject(i, { description: e.target.value })}
                      rows={3}
                    />
                  </label>
                  <label className="admin-label">
                    URL
                    <input
                      type="text"
                      className="admin-input"
                      value={project.url}
                      onChange={e => updateProject(i, { url: e.target.value })}
                    />
                  </label>
                  <label className="admin-label">
                    Status
                    <select
                      className="admin-select"
                      value={project.status}
                      onChange={e => {
                        const status = e.target.value as ProjectContent['status']
                        const labels: Record<string, string> = {
                          live: 'Live',
                          'coming-soon': 'Coming Soon',
                          research: 'Research Phase',
                        }
                        updateProject(i, { status, statusLabel: labels[status] ?? status })
                      }}
                    >
                      <option value="live">Live</option>
                      <option value="coming-soon">Coming Soon</option>
                      <option value="research">Research Phase</option>
                    </select>
                  </label>
                  <label className="admin-label">
                    Status Label
                    <input
                      type="text"
                      className="admin-input"
                      value={project.statusLabel}
                      onChange={e => updateProject(i, { statusLabel: e.target.value })}
                    />
                  </label>
                  <label className="admin-label">
                    AI Tools (comma-separated)
                    <input
                      type="text"
                      className="admin-input"
                      value={project.aiTools.join(', ')}
                      onChange={e =>
                        updateProject(i, {
                          aiTools: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => removeProject(i)}
                  >
                    Remove project
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button type="button" className="admin-btn admin-btn--secondary" onClick={addProject}>
        + Add project
      </button>
    </fieldset>
  )
}
