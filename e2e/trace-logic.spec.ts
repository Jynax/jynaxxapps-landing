import { test, expect } from '@playwright/test';
import { WORDS5, WORD_SET } from '../src/directions/terminal/trace/words5';
import { isOneLetterChange, bfsShortestPath, puzzleForDate } from '../src/directions/terminal/trace/traceLogic';
import { PUZZLES } from '../src/directions/terminal/trace/puzzles';

test('words5: non-empty, all 5 lowercase letters, set matches array', () => {
  expect(WORDS5.length).toBeGreaterThan(3000);
  expect(WORDS5.every(w => /^[a-z]{5}$/.test(w))).toBe(true);
  expect(WORD_SET.size).toBe(WORDS5.length);
  for (const w of ['stare', 'scare', 'share', 'shore', 'shone', 'world', 'house']) {
    expect(WORD_SET.has(w)).toBe(true);
  }
  expect(WORD_SET.has('zzzzz')).toBe(false);
});

test('isOneLetterChange: exactly one position differs, same length', () => {
  expect(isOneLetterChange('stare', 'scare')).toBe(true);  // pos2 t->c
  expect(isOneLetterChange('share', 'shore')).toBe(true);  // pos3 a->o
  expect(isOneLetterChange('stare', 'stare')).toBe(false); // unchanged
  expect(isOneLetterChange('stare', 'shore')).toBe(false); // 2 changes
  expect(isOneLetterChange('stare', 'stars')).toBe(true);  // pos5 e->s
  expect(isOneLetterChange('stare', 'star')).toBe(false);  // length diff
});

test('bfsShortestPath: returns a minimal valid ladder (hermetic word set)', () => {
  const set = new Set(['stare', 'scare', 'share', 'shore', 'shone', 'spare', 'snore']);
  const path = bfsShortestPath('stare', 'shone', set);
  expect(path).not.toBeNull();
  expect(path![0]).toBe('stare');
  expect(path![path!.length - 1]).toBe('shone');
  for (let i = 1; i < path!.length; i++) {
    expect(isOneLetterChange(path![i - 1], path![i])).toBe(true);
    expect(set.has(path![i])).toBe(true);
  }
  expect(path!.length - 1).toBe(3); // par = 3 steps: stare→share→shore→shone
});

test('bfsShortestPath: null when unreachable', () => {
  expect(bfsShortestPath('stare', 'pizza', new Set(['stare', 'pizza']))).toBeNull();
});

test('puzzleForDate: deterministic per local date, stable', () => {
  const table = [
    { id: 1, start: 'stare', target: 'shone', par: 4 },
    { id: 2, start: 'crane', target: 'plane', par: 2 },
  ];
  const d1 = new Date(2026, 4, 19);
  const d1b = new Date(2026, 4, 19, 23, 59);
  const d2 = new Date(2026, 4, 20);
  expect(puzzleForDate(d1, table).id).toBe(puzzleForDate(d1b, table).id);
  expect(puzzleForDate(d2, table).id).not.toBe(puzzleForDate(d1, table).id);
});

test('PUZZLES table is present and well-formed', () => {
  expect(PUZZLES.length).toBeGreaterThan(0);
  for (const p of PUZZLES) {
    expect(p.start).toMatch(/^[a-z]{5}$/);
    expect(p.target).toMatch(/^[a-z]{5}$/);
    expect(p.par).toBeGreaterThanOrEqual(3);
  }
});
