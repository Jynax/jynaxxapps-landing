import type { Puzzle } from './traceLogic';

// Seed pool. Each entry's `par` is the true shortest path over WORD_SET and is
// asserted by e2e/trace-puzzles.spec.ts (CI gate, spec §4). Grow over time;
// the daily selector cycles the list. Keep starts/targets COMMON words.
export const PUZZLES: Puzzle[] = [
  { id: 1, start: 'stare', target: 'shone', par: 3 },  // stare→share→shore→shone
  { id: 2, start: 'brain', target: 'grind', par: 4 },  // brain→braid→brand→grand→grind
  { id: 3, start: 'blaze', target: 'grace', par: 3 },  // blaze→glaze→graze→grace
  { id: 4, start: 'storm', target: 'sworn', par: 3 },  // storm→store→swore→sworn
  { id: 5, start: 'breed', target: 'bland', par: 3 },  // breed→bleed→blend→bland
  { id: 6, start: 'groan', target: 'brain', par: 3 },  // groan→groin→grain→brain
  { id: 7, start: 'shore', target: 'stale', par: 3 },  // shore→store→stare→stale
  { id: 8, start: 'grind', target: 'braid', par: 3 },  // grind→grand→brand→braid
  { id: 9, start: 'catch', target: 'harsh', par: 4 },  // catch→match→march→marsh→harsh
];
