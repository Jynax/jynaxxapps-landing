export function isOneLetterChange(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 1) return false;
  }
  return diff === 1;
}

export type Puzzle = { id: number; start: string; target: string; par: number };

export function bfsShortestPath(
  start: string,
  target: string,
  wordSet: ReadonlySet<string>,
): string[] | null {
  if (start === target) return [start];
  const queue: string[] = [start];
  const prev = new Map<string, string | null>([[start, null]]);
  while (queue.length) {
    const cur = queue.shift()!;
    for (let i = 0; i < 5; i++) {
      for (let c = 97; c < 123; c++) {
        const ch = String.fromCharCode(c);
        if (ch === cur[i]) continue;
        const next = cur.slice(0, i) + ch + cur.slice(i + 1);
        if (!wordSet.has(next) || prev.has(next)) continue;
        prev.set(next, cur);
        if (next === target) {
          const path = [next];
          let p = cur as string | null;
          while (p !== null) { path.push(p); p = prev.get(p) ?? null; }
          return path.reverse();
        }
        queue.push(next);
      }
    }
  }
  return null;
}

// Local-date → table index. Days since a fixed local epoch, mod table length.
export function puzzleForDate(date: Date, table: Puzzle[]): Puzzle {
  const EPOCH = Date.UTC(2026, 0, 1); // fixed reference
  const dayMs = 24 * 60 * 60 * 1000;
  const localMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const idx = Math.floor((localMidnight - EPOCH) / dayMs);
  return table[((idx % table.length) + table.length) % table.length];
}
