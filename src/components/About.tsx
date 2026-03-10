export function About() {
  return (
    <section className="about">
      <h2 className="section-title">About</h2>
      <div className="about-content">
        <p>
          I'm a maker who builds things because they're interesting.
          Reading analytics, game prototypes, WoW addons, security labs —
          if it sounds fun, I'll build it.
        </p>
        <p>
          Every project here is built in collaboration with AI.
          Not generated and forgotten — designed, iterated, shipped, and tracked.
          Claude, Cursor, and Codex are my co-pilots.
          I bring the ideas and the taste; they bring speed and tireless patience.
        </p>
        <p>
          The whole process is tracked in{' '}
          <a href="https://meta.jynaxxapps.com" target="_blank" rel="noopener noreferrer">
            Meta Tracker
          </a>
          {' '}— every session, every decision, every line of code.
          Radical transparency about how human+AI collaboration actually works.
        </p>
      </div>
    </section>
  )
}
