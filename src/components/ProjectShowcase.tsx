import { projects } from '../data/projects'
import { ProjectCard } from './ProjectCard'

export function ProjectShowcase() {
  return (
    <section className="projects">
      <h2 className="section-title">What I'm Building</h2>
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  )
}
