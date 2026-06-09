/**
 * code-review-fanout — Worked Example A as a standalone, runnable workflow.
 *
 * This is the review-only fan-out from
 *   ai-agent/claude-code-dynamic-workflows-design.md  (§7 — Worked example A).
 * It is NOT the SDLC pipeline: there is no Analyze / Develop / gate / loop here.
 * Point it at any diff and it does exactly one thing well:
 *
 *   Scope (1 agent buckets the diff)
 *     → Review (one reviewer per bucket, ALL in parallel)
 *       → Synthesize (1 cross-cutting pass that no single bucket can do)
 *         → Usage (no agent — report this run's token spend)
 *
 * The Code Review GATE inside  /sdlc-workflow  embeds this same pattern; this file
 * is the case where you want the fan-out on its own (review a PR, a branch, a range).
 *
 * It is GENERIC: reviewers discover the repo's own standards (AGENTS.md / CLAUDE.md /
 * .claude/rules/) instead of carrying a baked-in checklist, so you can drop it into any repo.
 *
 * ── Install ────────────────────────────────────────────────────────────────────
 *   Copy this file to your user-level workflows dir so it's available in every project:
 *     macOS / Linux:  cp code-review-fanout.js ~/.claude/workflows/
 *     Windows (PS):   Copy-Item code-review-fanout.js $HOME\.claude\workflows\
 *   (or drop it in a repo's own  .claude/workflows/  to scope it to that project).
 *
 * ── Run (slash command) ────────────────────────────────────────────────────────
 *   /code-review-fanout                       # reviews main...HEAD
 *   /code-review-fanout origin/main           # reviews origin/main...HEAD
 *   /code-review-fanout {"base":"main","head":"feature-x","maxGroups":8}
 *
 *   …or via the Workflow tool directly:
 *     Workflow({ name: "code-review-fanout", args: { base: "main", head: "HEAD" } })
 *
 *   Watch live progress with  /workflows .
 */

export const meta = {
  name: 'code-review-fanout',
  description: 'Scope a diff, fan out one reviewer per bucket (parallel), synthesize cross-cutting findings, report cost.',
  phases: [
    { title: 'Scope',      detail: 'one agent resolves the diff range and buckets changed files by package/dir' },
    { title: 'Review',     detail: 'one reviewer per bucket, in parallel, P0–P3 findings' },
    { title: 'Synthesize', detail: 'one cross-cutting consolidation pass' },
    { title: 'Usage',      detail: 'report this run’s token spend' },
  ],
};

// ── Args ──────────────────────────────────────────────────────────────────────
// A bare string is shorthand for { base: "<string>" }.
const a = (typeof args === 'string') ? { base: args } : (args || {});
const BASE = a.base || 'main';
const HEAD = a.head || 'HEAD';
const RANGE = `${BASE}...${HEAD}`;
const MAX_GROUPS = Number.isFinite(a.maxGroups) ? a.maxGroups : 6;
const LENS_MODEL = a.lensModel; // optional: run the per-bucket reviewers cheaper, e.g. "sonnet"

// ── Schemas (the contract the control flow branches on) ─────────────────────────
const SCOPE_SCHEMA = {
  type: 'object',
  required: ['range', 'summary', 'groups'],
  properties: {
    range: { type: 'string', description: 'the git diff range actually used, e.g. main...HEAD' },
    summary: { type: 'string' },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        required: ['key', 'label', 'diffCommand', 'rationale'],
        properties: {
          key: { type: 'string', description: 'short kebab-case id' },
          label: { type: 'string', description: 'display label, e.g. review:api' },
          diffCommand: { type: 'string', description: 'EXACT runnable command that prints this bucket\'s diff' },
          paths: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
        },
      },
    },
  },
};
const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['group', 'verdict', 'summary', 'findings'],
  properties: {
    group: { type: 'string' },
    verdict: { type: 'string', enum: ['ready', 'ready-with-fixes', 'changes-required', 'blocked'] },
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'title', 'location', 'problem', 'recommendation'],
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          title: { type: 'string' },
          location: { type: 'string', description: 'file:line' },
          problem: { type: 'string' },
          recommendation: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────────
// Resilient schema call: a sub-agent that fails to emit StructuredOutput resolves to
// null instead of aborting the whole run (and discarding all tokens already spent).
async function safeAgent(prompt, opts) {
  try { return await agent(prompt, Object.assign({ agentType: 'senior-reviewer' }, opts || {})); }
  catch (e) {
    log('agent "' + ((opts && opts.label) || 'review') + '" failed (' + String((e && e.message) || e).slice(0, 120) + ') — continuing with null.');
    return null;
  }
}
const lensOpts = (base) => (LENS_MODEL ? Object.assign({ model: LENS_MODEL }, base) : base);
function dedupeFindings(findings) {
  const seen = new Set(); const out = [];
  for (const f of findings) {
    if (!f || !f.title) continue;
    const key = f.severity + '|' + ((f.location || '').trim()) + '|' + String(f.title).trim().slice(0, 120);
    if (!seen.has(key)) { seen.add(key); out.push(f); }
  }
  return out;
}
const isBlocking = (f) => f.severity === 'P0' || f.severity === 'P1';

const DISCOVER = '\nBefore you act, DISCOVER this repo\'s standards rather than assuming them: read ' +
  'AGENTS.md (and any CLAUDE.md it references) and every file under .claude/rules/, then enforce ' +
  'whatever invariants and boundaries you find.\n';

// Capture the shared meter at the start so Usage can report this run's delta.
const startSpent = budget.spent();

// ── Phase 1: Scope (one read-only agent buckets the change) ──────────────────────
phase('Scope');
const scope = await safeAgent(
  'Read-only scoping task. Confirm the diff range `' + RANGE + '`, then bucket the changed files ' +
  'into at most ' + MAX_GROUPS + ' review groups by top-level package/dir. For each group return an ' +
  'EXACT runnable diffCommand of the form `git diff ' + RANGE + ' -- <paths>`. Detect changed ' +
  'submodules and give each its own bucket. Return the structured scope.',
  { label: 'scope', phase: 'Scope', schema: SCOPE_SCHEMA }
);

const groups = (scope && Array.isArray(scope.groups)) ? scope.groups : [];
if (!groups.length) {
  log('No changes for ' + ((scope && scope.range) || RANGE) + '. Nothing to review.');
  return { status: 'no_changes', range: (scope && scope.range) || RANGE };
}
log(groups.length + ' review bucket(s): ' + groups.map((g) => g.key).join(', '));

// ── Phase 2: Review (one reviewer per bucket, in PARALLEL) ────────────────────────
phase('Review');
const reviews = (await parallel(
  groups.map((g) => () =>
    safeAgent(
      'Review bucket "' + g.key + '". Why/what to scrutinise: ' + g.rationale + '\nSee its diff:\n  ' +
      g.diffCommand + '\nRead the FULL current version of any non-trivial changed file, not just the ' +
      'hunks.' + DISCOVER + '\nReport P0–P3 findings per the schema. Set group = "' + g.key + '".\n\n' +
      'Your FINAL action MUST be a call to the StructuredOutput tool.',
      lensOpts({ label: g.label || ('review:' + g.key), phase: 'Review', schema: FINDINGS_SCHEMA })
    ).then((r) => (r ? Object.assign({}, r, { group: g.key }) : null))
  )
)).filter(Boolean);

// ── Phase 3: Synthesize (the cross-cutting pass one bucket can't do) ──────────────
phase('Synthesize');
const synthesis = await safeAgent(
  'You are the LEAD reviewer consolidating ' + reviews.length + ' per-bucket reports for range ' +
  ((scope && scope.range) || RANGE) + '. Trace any data/control flow that spans buckets and confirm ' +
  'it is coherent (contracts, enums, types, security properties hold end to end). Output ONLY net-new ' +
  'cross-cutting findings; set group = "cross-cutting".' + DISCOVER + '\n\n' +
  JSON.stringify(reviews, null, 2) + '\n\nYour FINAL action MUST be a call to the StructuredOutput tool.',
  { label: 'synthesis', phase: 'Synthesize', schema: FINDINGS_SCHEMA }
);

// ── Phase 4: Usage (no agent — just report the delta) ─────────────────────────────
phase('Usage');
const all = [...reviews, ...(synthesis ? [synthesis] : [])];
const blocking = dedupeFindings(all.flatMap((r) => (r && r.findings) || [])).filter(isBlocking);
const outputTokensThisRun = budget.spent() - startSpent;
log('Output tokens this run: ' + outputTokensThisRun.toLocaleString() + ' | blocking (P0/P1): ' + blocking.length);

return {
  status: 'reviewed',
  range: (scope && scope.range) || RANGE,
  buckets: groups.map((g) => g.key),
  reviews,
  synthesis,
  blocking,
  tokenUsage: { outputTokensThisRun, budgetTotal: budget.total },
};
