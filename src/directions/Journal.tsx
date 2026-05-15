// Parked minimal stub — full design (journal.jsx) intentionally deferred; product owner iterates with designer separately.
import { ParkedStub } from './ParkedStub';

export default function Journal() {
  return (
    <ParkedStub
      directionId="journal"
      bg="var(--jrn-bg)"
      fg="var(--jrn-fg)"
      muted="var(--jrn-muted)"
      accent="var(--jrn-accent)"
      wordmarkFont="var(--font-serif)"
      wordmarkStyle={{ fontStyle: 'italic' }}
    />
  );
}
