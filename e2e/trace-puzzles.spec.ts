import { test, expect } from '@playwright/test';
import { bfsShortestPath } from '../src/directions/terminal/trace/traceLogic';
import { PUZZLES } from '../src/directions/terminal/trace/puzzles';
import { WORD_SET } from '../src/directions/terminal/trace/words5';
import { COMMON_WORD_SET } from '../src/directions/terminal/trace/words5common';

test('every puzzle is solvable and par is the true shortest path (≥3)', () => {
  for (const p of PUZZLES) {
    expect(WORD_SET.has(p.start), `${p.start} in dict`).toBe(true);
    expect(WORD_SET.has(p.target), `${p.target} in dict`).toBe(true);
    const path = bfsShortestPath(p.start, p.target, WORD_SET);
    expect(path, `#${p.id} ${p.start}->${p.target} solvable`).not.toBeNull();
    const par = path!.length - 1;
    expect(par, `#${p.id} par`).toBeGreaterThanOrEqual(3);
    expect(p.par, `#${p.id} declared par must equal true shortest`).toBe(par);
  }
  expect(PUZZLES.length, 'at least 6 seeded').toBeGreaterThanOrEqual(6);
});

test('every word on the BFS shortest path is a common word', () => {
  for (const p of PUZZLES) {
    const path = bfsShortestPath(p.start, p.target, WORD_SET);
    expect(path, `#${p.id} must be solvable`).not.toBeNull();
    for (const word of path!) {
      expect(
        COMMON_WORD_SET.has(word),
        `"${word}" in #${p.id} path (${p.start}→${p.target}) is not in COMMON_WORD_SET — replace this puzzle or add the word`,
      ).toBe(true);
    }
  }
});
