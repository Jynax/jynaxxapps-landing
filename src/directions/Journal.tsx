// Parked minimal stub — full design (journal.jsx) intentionally deferred; product owner iterates with designer separately.
import { ParkedStub } from './ParkedStub';
import { useFontFamilies } from './parts/useFontFamilies';

export default function Journal() {
  // Instrument Serif is Journal-only — inject lazily on first mount.
  useFontFamilies('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap')
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
