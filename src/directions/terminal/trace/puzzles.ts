import type { Puzzle } from './traceLogic';

// Seed pool. Each entry's `par` is the true shortest path over WORD_SET and is
// asserted by e2e/trace-puzzles.spec.ts (CI gate, spec §4). Grow over time;
// the daily selector cycles the list. Keep starts/targets COMMON words.
export const PUZZLES: Puzzle[] = [
  { id: 1, start: 'stare', target: 'shone', par: 3 },  // stare→share→shore→shone
  { id: 2, start: 'brain', target: 'grind', par: 4 },  // brain→braid→brand→grand→grind
  { id: 3, start: 'blaze', target: 'grace', par: 3 },  // blaze→glaze→graze→grace
  { id: 4, start: 'storm', target: 'sworn', par: 3 },  // storm→store→swore→sworn
  { id: 5, start: 'drink', target: 'grind', par: 4 },  // drink→brink→brins→grins→grind
  { id: 6, start: 'mourn', target: 'mount', par: 5 },  // mourn→bourn→bourd→bound→mound→mount
  { id: 7, start: 'crane', target: 'flame', par: 4 },  // crane→grane→grame→frame→flame
  { id: 8, start: 'black', target: 'white', par: 7 },  // black→alack→alick→alice→alite→arite→write→white
];
