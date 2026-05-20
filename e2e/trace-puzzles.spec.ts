import { test, expect } from '@playwright/test';
import { bfsShortestPath } from '../src/directions/terminal/trace/traceLogic';
import { PUZZLES } from '../src/directions/terminal/trace/puzzles';
import { WORD_SET } from '../src/directions/terminal/trace/words5';

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
