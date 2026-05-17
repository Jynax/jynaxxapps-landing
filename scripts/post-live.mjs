#!/usr/bin/env node
// Headless writer for the "what Jynaxx is doing right now" feed (Task #26).
//
// Used by the Stage-1 session-start ritual: after Michael approves a short,
// deliberately generic, public-safe one-liner, this posts it to /api/live.
// There is intentionally no admin form — Claude Code is the only writer.
//
// SERVICE TOKEN HANDLING (load-bearing — memory `feedback_no_secrets_in_shell_args`):
//   • The token is read ONLY from process.env.LIVE_FEED_TOKEN.
//   • It is set out-of-band (a persistent user env var sourced from the
//     credential store, and in the Cloudflare dashboard for the Function) —
//     NEVER pasted into an in-session shell command, NEVER an argv, NEVER
//     written to settings.local.json, NEVER committed. This script contains
//     no secret and is safe to commit.
//   • The token is never printed, logged, or echoed by this script.
//
// The ACTIVITY line is public-safe by construction (Michael-approved, generic,
// never a private project name) so it is an ordinary argument.
//
// Usage:
//   node scripts/post-live.mjs "wiring up a new landing-page widget"
//   node scripts/post-live.mjs "tidying a side project" --project remnants --since 1h
//   node scripts/post-live.mjs "lcc-contributed line" --source lcc
//   node scripts/post-live.mjs --delete                 # clear ALL entries
//   node scripts/post-live.mjs --delete --id <entryId>  # clear one entry

const API = process.env.LIVE_FEED_URL || 'https://jynaxxapps.com/api/live'

const token = process.env.LIVE_FEED_TOKEN
if (!token) {
  console.error(
    'LIVE_FEED_TOKEN is not set in the environment. Source it from the ' +
      'credential store (out-of-band) before posting. No post made.',
  )
  process.exit(1)
}

// Parse: positionals + `--flag value` options. `--delete` is a bare flag.
const argv = process.argv.slice(2)
const positionals = []
const opts = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--delete') {
    opts.delete = true
  } else if (a.startsWith('--')) {
    opts[a.slice(2)] = argv[++i] ?? ''
  } else {
    positionals.push(a)
  }
}

const auth = { Authorization: `Bearer ${token}` }

if (opts.delete) {
  // Guard a present-but-empty `--id` (parser yields '' when --id has no
  // value): without this it would silently fall through to clear-ALL, a
  // destructive surprise. Require an explicit value, or omit --id entirely.
  if ('id' in opts && !opts.id) {
    console.error('--id requires a value (omit --id entirely to clear ALL)')
    process.exit(1)
  }
  const url = opts.id ? `${API}?id=${encodeURIComponent(opts.id)}` : API
  const res = await fetch(url, { method: 'DELETE', headers: auth })
  console.log(`DELETE ${opts.id ? `(id=${opts.id})` : '(all)'} → ${res.status}`)
  process.exit(res.ok ? 0 : 1)
}

const activity = positionals.join(' ').trim()
if (!activity) {
  console.error('No activity line given. Usage: node scripts/post-live.mjs "<public-safe line>"')
  process.exit(1)
}

const source = opts.source === 'lcc' ? 'lcc' : 'wcc'

const body = {
  activity,
  project: opts.project || null,
  since: opts.since || 'today',
  // publicSafe is sent true by construction — the line is Michael-approved
  // (WCC) or LCC-tagged-then-approved. The server re-asserts it (spec §2).
  publicSafe: true,
  source,
}

const res = await fetch(API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...auth },
  body: JSON.stringify(body),
})

if (!res.ok) {
  console.error(`POST /api/live failed → ${res.status} ${res.statusText}`)
  process.exit(1)
}

const out = await res.json().catch(() => ({}))
console.log(
  `POST /api/live → ${res.status} · "${activity}" [${source}]` +
    (out && out.count ? ` · ${out.count}/${out.cap} in set` : ''),
)
