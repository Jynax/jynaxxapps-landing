import updates from '../../updates.json'

interface UpdateEntry {
  date: string
  project: string
  projectUrl: string
  category: string
  title: string
}

const MAX_DISPLAY = 8

export function RecentUpdates() {
  const entries = (updates as UpdateEntry[]).slice(0, MAX_DISPLAY)

  if (entries.length === 0) return null

  return (
    <section className="recent-updates">
      <h2 className="section-title">Recent Updates</h2>
      <ul className="updates-list">
        {entries.map((entry, i) => (
          <li key={`${entry.date}-${entry.project}-${i}`} className="update-item">
            <div className="update-item-header">
              <a
                href={entry.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="update-project-link"
              >
                {entry.project}
              </a>
              <span className={`update-category update-category--${entry.category.toLowerCase()}`}>
                {entry.category}
              </span>
            </div>
            <p className="update-title">{entry.title}</p>
            <time className="update-date" dateTime={entry.date}>
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}
