#!/usr/bin/env node
// Headless writer for the Arcade scoreboard (Task #36 WS2).
//
// Aggregates real numbers and POSTs them to /api/stats. Run as part of the
// end-of-day "done for the night" shutdown routine (session-end skill Step 6),
// via the Credential-Manager wrapper that reads LIVE_FEED_TOKEN from the
// Windows Credential Store and injects it into the child-process environment
// (same mechanism as post-live.mjs — see memory project_jynaxxapps_live_feed,
// Decision 10.2). Roughly once a day; the UPDATED stamp in the widget keeps
// the display honest between refreshes.
//
// SERVICE TOKEN HANDLING (load-bearing — memory `feedback_no_secrets_in_shell_args`):
//   • The token is read ONLY from process.env.LIVE_FEED_TOKEN.
//   • It is NEVER an argv, NEVER echoed, NEVER written to git or settings.
//
// Usage (via Credential-Manager wrapper — do NOT call with the token on the CLI):
//   node scripts/post-stats.mjs
//   node scripts/post-stats.mjs --dry-run   # print payload without posting

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { execSync } from 'child_process'

const API = process.env.STATS_URL || 'https://jynaxxapps.com/api/stats'
const DRY_RUN = process.argv.includes('--dry-run')

const token = process.env.LIVE_FEED_TOKEN
if (!token && !DRY_RUN) {
  console.error(
    'LIVE_FEED_TOKEN is not set in the environment. Source it from the ' +
      'credential store (out-of-band) before posting. No post made.',
  )
  process.exit(1)
}

// ── since: Meta Tracker inception date (2026-02-26) → 'FEB 2026' ────────────
const INCEPTION = new Date('2026-02-26')
const SINCE_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const since = `${SINCE_MONTHS[INCEPTION.getUTCMonth()]} ${INCEPTION.getUTCFullYear()}`

// ── projects: count of JX_PROJECTS in the repo's source register ─────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const jxDataPath = join(__dirname, '../src/data/jxData.ts')
const jxDataSrc = readFileSync(jxDataPath, 'utf8')

// Extract the JX_PROJECTS array block and count `id:` entries — single source
// of truth already in the repo; do not hardcode the number.
const jxStart = jxDataSrc.indexOf('export const JX_PROJECTS')
const jxEnd = jxDataSrc.indexOf('\n];', jxStart)
const jxBlock = jxStart !== -1 && jxEnd !== -1
  ? jxDataSrc.slice(jxStart, jxEnd)
  : ''
const projects = (jxBlock.match(/\bid:/g) || []).length
if (projects === 0) {
  console.error('Could not count JX_PROJECTS from src/data/jxData.ts — aborting.')
  process.exit(1)
}

// ── prsMerged: sum of merged PRs across all Jynax GitHub repos ───────────────
function gh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim()
}

let prsMerged = 0
try {
  const repoNames = gh('gh repo list Jynax --limit 100 --json name --jq ".[].name"')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  for (const name of repoNames) {
    const count = parseInt(
      gh(`gh pr list -R Jynax/${name} --state merged --limit 1000 --json number --jq "length"`),
      10,
    )
    if (!isNaN(count)) prsMerged += count
  }
} catch (err) {
  console.error(`gh command failed: ${err.message}`)
  process.exit(1)
}

// ── Payload ───────────────────────────────────────────────────────────────────
const payload = { since, projects, prsMerged }
console.log(`stats payload: since=${since} projects=${projects} prsMerged=${prsMerged}`)

if (DRY_RUN) {
  console.log('--dry-run: no POST made.')
  process.exit(0)
}

const res = await fetch(API, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
})

if (!res.ok) {
  console.error(`POST ${API} failed → ${res.status} ${res.statusText}`)
  process.exit(1)
}

console.log(`POST /api/stats → ${res.status} · SINCE=${since} PROJECTS=${projects} PRS_MERGED=${prsMerged}`)
