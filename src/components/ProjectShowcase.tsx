import type { ProjectContent } from '../types/content'
import { ProjectCard } from './ProjectCard'

export function ProjectShowcase({ projects }: { projects: ProjectContent[] }) {
  const visible = projects.filter(p => p.visible)

  return (
    <section className="projects">
      <h2 className="section-title">What I'm Building</h2>
      <div className="projects-grid">
        {visible.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
