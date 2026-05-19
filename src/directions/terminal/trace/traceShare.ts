export function formatShare(r: {
  id: number; result: 'win' | 'loss';
  moves: number; par: number; streak: number; maxStreak: number;
}): string {
  const tail = `streak ${r.streak} · best ${r.maxStreak}\njynaxxapps.com`;
  if (r.result === 'win') {
    return `TRACE #${r.id}  ▸ resolved ${r.moves} / par ${r.par}\n`
      + `${'▮'.repeat(r.moves)}\n${tail}`;
  }
  return `TRACE #${r.id}  ▸ no route · dropped ${r.moves}/par${r.par}\n${tail}`;
}
