import type { SiteContent } from '../types/content'

export function About({ about }: { about: SiteContent['about'] }) {
  return (
    <section className="about">
      <h2 className="section-title">About</h2>
      <div className="about-content">
        {about.paragraphs.map((html, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </div>
    </section>
  )
}
