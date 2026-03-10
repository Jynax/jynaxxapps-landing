import type { SiteContent } from '../types/content'

export function Hero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-name">{hero.title}</h1>
        <p className="hero-tagline">{hero.subtitle}</p>
        <p className="hero-sub">{hero.tagline}</p>
      </div>
    </section>
  )
}
