import type { SiteContent } from '../types/content'

export function Footer({ footer }: { footer: SiteContent['footer'] }) {
  return (
    <footer className="footer">
      <div className="footer-links">
        {footer.links.map(link => (
          <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
      </div>
      <p className="footer-note" dangerouslySetInnerHTML={{ __html: footer.note }} />
    </footer>
  )
}
