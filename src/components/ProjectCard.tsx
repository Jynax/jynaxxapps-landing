import type { ProjectContent } from '../types/content'

export function ProjectCard({ project }: { project: ProjectContent }) {
  const isComingSoon = project.status === 'coming-soon'

  const card = (
    <div className={`project-card ${isComingSoon ? 'project-card--coming-soon' : ''}`}>
      <div className="project-card-header">
        <h3 className="project-card-name">{project.name}</h3>
        <span className={`project-card-status project-card-status--${project.status}`}>
          {project.statusLabel}
        </span>
      </div>
      <p className="project-card-tagline">{project.tagline}</p>
      <p className="project-card-desc">{project.description}</p>
      <div className="project-card-footer">
        <div className="project-card-tools">
          {project.aiTools.map(tool => (
            <span key={tool} className="project-card-tool">{tool}</span>
          ))}
        </div>
        {!isComingSoon && (
          <span className="project-card-link-hint">Visit &rarr;</span>
        )}
      </div>
    </div>
  )

  if (isComingSoon) return card

  return (
    <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-card-anchor">
      {card}
    </a>
  )
}
