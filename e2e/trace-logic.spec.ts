import { test, expect } from '@playwright/test';
import { WORDS5, WORD_SET } from '../src/directions/terminal/trace/words5';
import { isOneLetterChange } from '../src/directions/terminal/trace/traceLogic';

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
