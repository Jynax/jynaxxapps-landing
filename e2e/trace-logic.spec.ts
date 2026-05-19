import { test, expect } from '@playwright/test';
import { WORDS5, WORD_SET } from '../src/directions/terminal/trace/words5';
import { isOneLetterChange, bfsShortestPath, puzzleForDate, createGame, submitWord } from '../src/directions/terminal/trace/traceLogic';
import { PUZZLES } from '../src/directions/terminal/trace/puzzles';
import { loadState, recordResult, isLockedToday } from '../src/directions/terminal/trace/traceStorage';
import { formatShare } from '../src/directions/terminal/trace/traceShare';

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

const SET = new Set(['stare','scare','share','shore','shone','spare','sward','sword']);

test('createGame: budget = par + 5, starts playing', () => {
  const g = createGame({ id: 1, start: 'stare', target: 'shone', par: 4 });
  expect(g.status).toBe('playing');
  expect(g.path).toEqual(['stare']);
  expect(g.movesLeft).toBe(9); // 4 + 5
});

test('submitWord: valid move advances, decrements budget', () => {
  let g = createGame({ id: 1, start: 'stare', target: 'shone', par: 4 });
  const r = submitWord(g, 'scare', SET);
  expect(r.error).toBeUndefined();
  expect(r.game.path).toEqual(['stare', 'scare']);
  expect(r.game.movesLeft).toBe(8);
  expect(r.game.status).toBe('playing');
});

test('submitWord: rejects bad input WITHOUT consuming budget', () => {
  const g = createGame({ id: 1, start: 'stare', target: 'shone', par: 4 });
  for (const [w, code] of [['star','length'],['zzzzz','notword'],['shore','toofar'],['stare','same']] as const) {
    const r = submitWord(g, w, SET);
    expect(r.error).toBe(code);
    expect(r.game.movesLeft).toBe(9);
    expect(r.game.path).toEqual(['stare']);
  }
});

test('submitWord: reaching target wins', () => {
  let g = createGame({ id: 1, start: 'stare', target: 'shone', par: 4 });
  for (const w of ['scare','share','shore','shone']) g = submitWord(g, w, SET).game;
  expect(g.status).toBe('won');
});

test('submitWord: exhausting budget without target loses', () => {
  let g = createGame({ id: 1, start: 'stare', target: 'sword', par: 4 });
  // 9 valid non-target moves bouncing between known words
  const bounce = ['scare','share','shore','shone','shore','share','scare','share','shore'];
  for (const w of bounce) g = submitWord(g, w, SET).game;
  expect(g.movesLeft).toBe(0);
  expect(g.status).toBe('lost');
});

function mem() {
  const m = new Map<string,string>();
  return { getItem:(k:string)=>m.get(k)??null, setItem:(k:string,v:string)=>{m.set(k,v);} } as Storage;
}
const D = (s:string)=>new Date(s+'T12:00:00');

test('streak: first-ever win = 1; consecutive win = +1; lock same day', () => {
  const s = mem();
  recordResult(s, { result:'win', path:['stare','shone'] }, D('2026-05-19'));
  let st = loadState(s);
  expect(st.streak).toBe(1);
  expect(st.maxStreak).toBe(1);
  expect(isLockedToday(s, D('2026-05-19'))).toBe(true);
  expect(isLockedToday(s, D('2026-05-20'))).toBe(false);

  recordResult(s, { result:'win', path:['x'] }, D('2026-05-20'));
  st = loadState(s);
  expect(st.streak).toBe(2);
});

test('streak: loss resets to 0; skipped day resets; corrupt = fresh', () => {
  const s = mem();
  recordResult(s, { result:'win', path:['x'] }, D('2026-05-19'));
  recordResult(s, { result:'loss', path:['x'] }, D('2026-05-20'));
  expect(loadState(s).streak).toBe(0);
  expect(loadState(s).maxStreak).toBe(1);

  recordResult(s, { result:'win', path:['x'] }, D('2026-05-21'));
  recordResult(s, { result:'win', path:['x'] }, D('2026-05-25')); // 4-day gap
  expect(loadState(s).streak).toBe(1); // reset then this win = 1

  s.setItem('trace.v1', '{not json');
  expect(loadState(s).streak).toBe(0);
});

test('formatShare: win has block row, loss has none, never leaks words', () => {
  const win = formatShare({ id:147, result:'win', moves:6, par:4, streak:7, maxStreak:12 });
  expect(win).toBe(
`TRACE #147  ▸ resolved 6 / par 4
▮▮▮▮▮▮
streak 7 · best 12
jynaxxapps.com`);
  const loss = formatShare({ id:147, result:'loss', moves:9, par:4, streak:0, maxStreak:12 });
  expect(loss).toBe(
`TRACE #147  ▸ no route · dropped 9/par4
streak 0 · best 12
jynaxxapps.com`);
  expect(win).not.toMatch(/\b[a-z]{5}\b/); // no 5-letter words leaked
});
