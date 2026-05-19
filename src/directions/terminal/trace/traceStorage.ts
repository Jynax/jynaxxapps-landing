const KEY = 'trace.v1';

export type TraceState = {
  lastPlayedDate: string | null; // local YYYY-MM-DD
  lastResult: 'win' | 'loss' | null;
  lastPath: string[];
  streak: number;
  maxStreak: number;
  totalPlayed: number;
};

const FRESH: TraceState = {
  lastPlayedDate: null, lastResult: null, lastPath: [],
  streak: 0, maxStreak: 0, totalPlayed: 0,
};

function localYMD(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function loadState(storage: Storage): TraceState {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return { ...FRESH };
    const p = JSON.parse(raw) as Partial<TraceState>;
    return { ...FRESH, ...p };
  } catch {
    return { ...FRESH };
  }
}

export function isLockedToday(storage: Storage, today: Date): boolean {
  return loadState(storage).lastPlayedDate === localYMD(today);
}

function dayDiff(aYMD: string, b: Date): number {
  const [y, m, d] = aYMD.split('-').map(Number);
  const a = Date.UTC(y, m - 1, d);
  const bb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bb - a) / 86400000);
}

export function recordResult(
  storage: Storage,
  outcome: { result: 'win' | 'loss'; path: string[] },
  today: Date,
): void {
  const prev = loadState(storage);
  let streak = 0;
  if (outcome.result === 'win') {
    streak = (prev.lastPlayedDate && dayDiff(prev.lastPlayedDate, today) === 1)
      ? prev.streak + 1
      : 1; // first-ever, reset-then-win, or post-loss/gap win
  }
  const next: TraceState = {
    lastPlayedDate: localYMD(today),
    lastResult: outcome.result,
    lastPath: outcome.path,
    streak,
    maxStreak: Math.max(prev.maxStreak, streak),
    totalPlayed: prev.totalPlayed + 1,
  };
  storage.setItem(KEY, JSON.stringify(next));
}
