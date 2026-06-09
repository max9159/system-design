/**
 * sdlc-workflow — a runnable, generic SDLC dynamic workflow for Claude Code.
 *
 * This single file fuses the two worked examples from
 *   ai-agent/claude-code-dynamic-workflows-design.md
 *     • Worked example B — a gated SDLC pipeline (the outer structure + gates), and
 *     • Worked example A — a code-review fan-out (used INSIDE the Code Review gate:
 *       scope the diff → one reviewer per bucket in parallel → synthesize).
 *
 * Flow:
 *   Analyze (parallel research vectors → 1 synthesis writer writes the design doc)
 *     → Design Review  (gate-first: dedicated pass alone, then lenses confirm; loops back)
 *       → Development   (baseline capture → ONE developer writes the code)
 *         → Code Review (gate-first dedicated pass, then scope→per-bucket fan-out→synthesize; loops back)
 *           → Summary   (commit prompt + per-stage stats)
 *
 * It is GENERIC: reviewers discover the repo's own standards (AGENTS.md / CLAUDE.md /
 * .claude/rules/) instead of carrying a baked-in checklist, so you can drop it into any repo.
 *
 * ── Install ────────────────────────────────────────────────────────────────────
 *   Copy this file to your user-level workflows dir so it's available in every project:
 *     macOS / Linux:  cp sdlc-workflow.js ~/.claude/workflows/
 *     Windows (PS):   Copy-Item sdlc-workflow.js $HOME\.claude\workflows\
 *   (or drop it in a repo's own  .claude/workflows/  to scope it to that project).
 *
 * ── Run (slash command) ────────────────────────────────────────────────────────
 *   /sdlc-workflow add rate limiting to the webhook endpoint
 *   /sdlc-workflow {"requirement":"add SSO login","startStage":"design-review"}
 *
 *   …or via the Workflow tool directly:
 *     Workflow({ name: "sdlc-workflow", args: { requirement: "<what to build>" } })
 *
 *   Watch live progress with  /workflows .
 */

export const meta = {
  name: 'sdlc-workflow',
  description:
    'Requirement → commit-ready, with independent review gates after design and after code. ' +
    'Analyze (parallel research → 1 writer) → Design Review (gate, loops back) → Development ' +
    '(single writer) → Code Review (scope→per-bucket fan-out→synthesize, gate, loops back) → Summary.',
  phases: [
    { title: 'Analyze',       detail: 'parallel read-only research vectors, then one synthesis writer writes the design doc' },
    { title: 'Design Review', detail: 'gate-first: dedicated OQ/decisions pass alone, then lenses confirm; fail loops back to Analyze' },
    { title: 'Development',    detail: 'capture baseline test failures, then one developer implements (single writer)' },
    { title: 'Code Review',    detail: 'gate-first dedicated pass, then scope the diff → one reviewer per bucket (parallel) → synthesize; fail loops back' },
    { title: 'Summary',        detail: 'commit suggestion + per-role runs + per-stage tokens' },
  ],
};

// ── Args ────────────────────────────────────────────────────────────────────────
// A bare string is shorthand for { requirement: "<string>" }.
const rawArgs = (args && typeof args === 'object') ? args : { requirement: args };
const requirement = rawArgs.requirement;

function slugify(text) {
  const s = String(text ?? '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .split(/\s+/).slice(0, 6).join('-').slice(0, 60).replace(/-+$/g, '');
  return s || 'untitled-feature';
}
const featureSlug = rawArgs.featureSlug ?? slugify(requirement);
const handoffPath = rawArgs.handoffPath ?? ('docs/agent-handoffs/' + featureSlug + '-design.md');

const STAGES = ['analyze', 'design-review', 'develop', 'code-review'];
const START = rawArgs.startStage ?? 'analyze';
const startIdx = STAGES.indexOf(START);
if (startIdx < 0) throw new Error('Invalid startStage "' + START + '". Expected: ' + STAGES.join(', '));
if (START === 'analyze' && !requirement) {
  throw new Error('Missing args.requirement — pass a string, or { requirement, featureSlug?, startStage? }.');
}

const MAX_DESIGN = Number(rawArgs.maxDesignRounds ?? 3);
const MAX_DEV = Number(rawArgs.maxDevRounds ?? 3);
const BASE = rawArgs.base || 'main';
const HEAD = rawArgs.head || 'HEAD';
const RANGE = BASE + '...' + HEAD;
const MAX_GROUPS = Number.isFinite(rawArgs.maxGroups) ? rawArgs.maxGroups : 6;
const LENS_MODEL = rawArgs.lensModel; // optional: run parallel lenses cheaper, e.g. "sonnet"

function normalizeList(list, fallback) {
  const src = Array.isArray(list) && list.length ? list : fallback;
  return src.map((x, i) => typeof x === 'string'
    ? { key: x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24) || ('v' + i), prompt: x }
    : x);
}
const ANALYSIS_VECTORS = normalizeList(rawArgs.analysisVectors, [
  'requirements, scope, and which module/service owns the change',
  'existing-code reuse and architecture fit without crossing boundaries',
  'data model / schema / shared-contract impact and backward compatibility',
  'edge cases, failure modes, and security boundaries',
  'test strategy and a plan-to-test mapping',
]);
const DESIGN_LENSES = normalizeList(rawArgs.designLenses, [
  'correctness and logic conflicts',
  'architecture invariants and module boundaries',
  'shared types/contracts and backward compatibility',
  'test coverage and plan-to-test mapping',
  'simplicity and over-engineering',
]);

// ── Schemas (the contract your control flow branches on) ─────────────────────────
const NOTES_SCHEMA = {
  type: 'object',
  required: ['vector', 'findings'],
  properties: {
    vector: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
  },
};
const DESIGN_REVIEW_SCHEMA = {
  type: 'object',
  required: ['verdict', 'findings', 'required_changes', 'has_open_questions', 'open_questions', 'decisions'],
  properties: {
    verdict: { type: 'string', enum: ['Ready', 'Not Ready'] },
    findings: { type: 'array', items: { type: 'string' } },
    required_changes: { type: 'array', items: { type: 'string' } },
    has_open_questions: { type: 'boolean', description: 'true if the doc has unresolved questions needing a USER product/scope decision' },
    open_questions: { type: 'array', items: { type: 'string' } },
    decisions: { type: 'array', items: { type: 'string' }, description: 'Each resolved decision, copied verbatim, one per item.' },
  },
};
const LENS_SCHEMA = {
  type: 'object',
  required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string' },
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'finding'],
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          finding: { type: 'string' },
          location: { type: 'string', description: 'file:line if applicable' },
        },
      },
    },
  },
};
const BASELINE_SCHEMA = {
  type: 'object',
  required: ['failures'],
  properties: {
    failures: { type: 'array', items: { type: 'string' }, description: 'Test names failing on the pre-dev working tree.' },
    note: { type: 'string' },
  },
};
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
const CODE_DEDICATED_SCHEMA = {
  type: 'object',
  required: ['verdict', 'findings', 'p0_p1_findings', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['Pass', 'Fail'] },
    findings: { type: 'array', items: { type: 'string' } },
    p0_p1_findings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
};
const BUCKET_FINDINGS_SCHEMA = {
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

// ── Helpers ──────────────────────────────────────────────────────────────────────
const roleRuns = {};
const stageTokens = {};
function note(role, n) { roleRuns[role] = (roleRuns[role] || 0) + (n || 1); }
async function callAgent(role, prompt, opts) { note(role); return agent(prompt, Object.assign({ agentType: role }, opts || {})); }
// Resilient schema call: a sub-agent that fails to emit StructuredOutput resolves to
// null instead of aborting the whole run (and discarding all tokens already spent).
async function safeAgent(role, prompt, opts) {
  try { return await callAgent(role, prompt, opts); }
  catch (e) {
    log('agent "' + ((opts && opts.label) || role) + '" failed (' + String((e && e.message) || e).slice(0, 120) + ') — continuing with null.');
    return null;
  }
}
const lensOpts = (base) => (LENS_MODEL ? Object.assign({ model: LENS_MODEL }, base) : base);
async function tokenedStage(title, fn) {
  const before = budget.spent();
  const res = await fn();
  stageTokens[title] = (stageTokens[title] || 0) + (budget.spent() - before);
  return res;
}
function dedupeFindings(findings) {
  const seen = new Set(); const out = [];
  for (const f of findings) {
    if (!f || !(f.finding || f.title)) continue;
    const key = f.severity + '|' + ((f.location || '').trim()) + '|' + String(f.finding || f.title).trim().slice(0, 120);
    if (!seen.has(key)) { seen.add(key); out.push(f); }
  }
  return out;
}
const isBlocking = (f) => f.severity === 'P0' || f.severity === 'P1';

const DISCOVER = '\nBefore you act, DISCOVER this repo\'s standards rather than assuming them: read ' +
  'AGENTS.md (and any CLAUDE.md it references) and every file under .claude/rules/, then enforce ' +
  'whatever invariants and boundaries you find.\n';

// ════════════════════════════════════════════════════════════════════════════════
//  Phase 1+2 — Design (Analyze fan-out → Design Review gate)
// ════════════════════════════════════════════════════════════════════════════════
let collectedDecisions = [];
let designReady = startIdx > STAGES.indexOf('design-review');
let designRounds = 0;
let designFindings = '';
let skipAnalyze = START === 'design-review';

if (!designReady) {
  for (let round = 1; round <= MAX_DESIGN; round++) {
    designRounds = round;
    log('Design round ' + round + '/' + MAX_DESIGN);

    // ── Analyze: fan out READ-ONLY analysts → a SINGLE synthesis writer ──
    if (!skipAnalyze) {
      phase('Analyze');
      await tokenedStage('Analyze', async () => {
        if (round === 1) {
          const notes = await parallel(ANALYSIS_VECTORS.map((v) => () =>
            callAgent('general-purpose',
              'Acting as a focused analyst, analyze ONLY the "' + v.prompt + '" dimension of this ' +
              'requirement against the ACTUAL source (cite file:line). Do NOT write any files — return ' +
              'structured notes only.' + DISCOVER + '\nRequirement:\n' + requirement,
              { phase: 'Analyze', label: 'analyze:' + v.key, schema: NOTES_SCHEMA })));
          await callAgent('general-purpose',
            'Synthesize the per-dimension analysis notes below into a single, decision-ready design/' +
            'development plan and WRITE it to ' + handoffPath + '. Cover the owning module, affected ' +
            'files, architecture-invariant impact, shared-types/schema impact, edge cases, a ' +
            'plan-to-test mapping, verification commands, and (if any) an `## Open Questions` and ' +
            '`## Decisions` section.' + DISCOVER + '\nRequirement:\n' + requirement +
            '\n\nPer-dimension notes:\n' + JSON.stringify(notes, null, 2),
            { phase: 'Analyze', label: 'analyze:synthesize' });
        } else {
          await callAgent('general-purpose',
            'The design-reviewer REJECTED the previous design. Read the existing doc at ' + handoffPath +
            ', apply ALL required changes below, and overwrite the file. Edit only the Markdown doc — ' +
            'do not touch source.\n\nRequired changes:\n\n' + designFindings,
            { phase: 'Analyze', label: 'analyze:revise#' + round });
        }
      });
    }
    skipAnalyze = false;

    // ── Design Review: GATE-FIRST (dedicated pass alone; lenses only confirm) ──
    log('Running Design Review (dedicated pass + ' + DESIGN_LENSES.length + ' lenses, gate-first)...');
    let reviewResult = null;
    let lensBlocking = [];
    await tokenedStage('Design Review', async () => {
      reviewResult = await safeAgent('general-purpose',
        'You are a senior design reviewer. Review the design document at: ' + handoffPath + DISCOVER +
        '\nRead it end-to-end, verify all file/line claims against the codebase, check all architecture ' +
        'invariants, and assess the test plan for runnability.\n\n' +
        'Open-Questions gate: if the doc has UNRESOLVED questions that require a USER product/scope ' +
        'decision, set has_open_questions=true and list them. Questions already answered in a ' +
        '`## Decisions` section are RESOLVED — do not flag them.\n\n' +
        'Decisions extraction: copy each resolved decision verbatim into `decisions` (one per item).\n\n' +
        'Your FINAL action MUST be a call to the StructuredOutput tool with the required schema.',
        { label: 'design:dedicated#' + round, phase: 'Design Review', schema: DESIGN_REVIEW_SCHEMA });

      const dedicatedReady = reviewResult && reviewResult.verdict === 'Ready' &&
        !(reviewResult.has_open_questions && reviewResult.open_questions.length > 0);

      if (dedicatedReady) {
        const reviews = await parallel(DESIGN_LENSES.map((l) => () =>
          safeAgent('general-purpose',
            'Review the design doc at ' + handoffPath + ' THROUGH ONE LENS: "' + l.prompt + '".' + DISCOVER +
            '\nVerify load-bearing claims against the ACTUAL source (cite file:line). Read only the few ' +
            'files THIS lens needs. Report findings with severity P0-P3 (P0/P1 are blocking). Only ' +
            'report issues for THIS lens.\n\nYour FINAL action MUST be a call to the StructuredOutput tool.',
            lensOpts({ label: 'design:' + l.key + '#' + round, phase: 'Design Review', schema: LENS_SCHEMA }))));
        lensBlocking = dedupeFindings(reviews.filter(Boolean).flatMap((r) => (r && r.findings) || [])).filter(isBlocking);
      } else {
        log('Dedicated design pass not Ready (or has open questions) — skipping lens fan-out (gate-first).');
      }
    });

    if (!reviewResult) {
      log('design dedicated pass returned null — treating as Not Ready.');
      if (round === MAX_DESIGN) throw new Error('Design approval failed after ' + MAX_DESIGN + ' rounds (null reviewer).');
      continue;
    }

    // Open-Questions gate: pause for a user decision.
    if (reviewResult.has_open_questions && reviewResult.open_questions.length > 0) {
      log('Design has unresolved Open Questions — pausing for user input.');
      phase('Summary');
      return {
        status: 'awaiting_user', next_action: 'answer_open_questions', handoffDoc: handoffPath,
        open_questions: reviewResult.open_questions, designRounds, agentRuns: roleRuns, stageTokens,
        totalOutputTokens: budget.spent(),
        message: 'Answer the open questions in the handoff doc (preferably under a `## Decisions` ' +
          'section), then re-invoke with startStage:"design-review" (or "develop" if the doc is final).\n\n' +
          'Handoff doc: ' + handoffPath,
      };
    }

    log('Design verdict: ' + reviewResult.verdict + ' | Lens P0/P1: ' + lensBlocking.length +
        ' | Decisions captured: ' + (reviewResult.decisions?.length ?? 0));

    if (reviewResult.verdict === 'Ready' && lensBlocking.length === 0) {
      designReady = true;
      collectedDecisions = reviewResult.decisions ?? [];
      break;
    }

    designFindings = [
      ...reviewResult.required_changes.map((c) => '- ' + c),
      ...reviewResult.findings.map((c) => '- ' + c),
      ...lensBlocking.map((f) => '- [' + f.severity + '] ' + f.finding + (f.location ? ' (' + f.location + ')' : '')),
    ].join('\n');

    if (round === MAX_DESIGN) throw new Error('Design approval failed after ' + MAX_DESIGN + ' rounds.\n\nLast findings:\n' + designFindings);
  }
} else {
  // Entering past Design Review: read the existing decisions once so the
  // decision-fidelity check still has something to verify against.
  log('startStage="' + START + '" — bypassing Analyze + Design Review. Doc assumed final at ' + handoffPath + '.');
  const read = await callAgent('general-purpose',
    'Read the design document at ' + handoffPath + ' and copy each RESOLVED decision verbatim into ' +
    '`decisions` (one per item). Do NOT review anything else.',
    { label: 'decisions-read', phase: 'Design Review', schema: { type: 'object', required: ['decisions'], properties: { decisions: { type: 'array', items: { type: 'string' } } } } });
  collectedDecisions = read?.decisions ?? [];
}

// ════════════════════════════════════════════════════════════════════════════════
//  Phase 3 — Development (baseline capture → single developer writer)
// ════════════════════════════════════════════════════════════════════════════════
phase('Development');
log('Capturing baseline test failures (pre-dev)...');
const baseline = await (async () => {
  note('general-purpose');
  return agent(
    'You run BEFORE any code changes. Capture the test failures that already exist so a reviewer can ' +
    'later tell pre-existing failures from regressions.\nProcedure: 1) `git stash -u --keep-index` ' +
    '(no-op if clean). 2) Run the repo\'s test command; capture failing test NAMES only. 3) `git stash ' +
    'pop` if you stashed — the working tree MUST end as you found it. 4) Return the failing list ' +
    '(empty = clean). If the runner crashes, return an empty list and explain in `note`.',
    { label: 'baseline-tests', phase: 'Development', schema: BASELINE_SCHEMA });
})();
const baselineFailures = baseline?.failures ?? [];
const baselineBlock = baselineFailures.length
  ? '\n\nPre-existing test failures (DO NOT count as regressions):\n' + baselineFailures.map((f) => '- ' + f).join('\n')
  : '\n\nBaseline: 0 failing tests pre-dev. Any new failure is a regression.';
const decisionsBlock = collectedDecisions.length
  ? '\n\nDesign Decisions that MUST be implemented (or, if deferred, recorded in BOTH `### Deviations ' +
    'From Plan` AND `### Risks or Follow-Ups`):\n' + collectedDecisions.map((d, i) => (i + 1) + '. ' + d).join('\n')
  : '';
log('Baseline captured: ' + baselineFailures.length + ' pre-existing failure(s).');

// ── Development loop (developer → Code Review gate) ──
let codeFindings = '';
let codeApproved = false;
let devRounds = 0;
let skipDevelop = START === 'code-review';

for (let round = 1; round <= MAX_DEV; round++) {
  devRounds = round;
  log('Development round ' + round + '/' + MAX_DEV);

  if (!skipDevelop) {
    phase('Development');
    await tokenedStage('Development', async () => {
      const prompt = round === 1
        ? 'You are the developer. The design is approved — implement it now.\nHandoff plan: ' + handoffPath +
          decisionsBlock + baselineBlock + DISCOVER + '\nRead the plan in full, implement the smallest ' +
          'complete change, run the plan\'s verification commands, and append an Implementation Summary ' +
          '(with `### Deviations From Plan` and `### Risks or Follow-Ups`) to the handoff file. Do NOT commit.'
        : 'You are the developer. Code review found blocking issues (P0/P1). Fix them.\nHandoff plan: ' +
          handoffPath + decisionsBlock + baselineBlock + '\n\nP0/P1 findings that MUST be fixed:\n\n' +
          codeFindings + DISCOVER + '\nInspect the current git diff, address every finding, run ' +
          'verification commands, and update the Implementation Summary. Do NOT commit.';
      await callAgent('general-purpose', prompt, { label: 'developer#' + round, phase: 'Development' });
    });
  }
  skipDevelop = false;

  // ── Code Review: gate-first dedicated pass, then Example-A fan-out to confirm ──
  log('Running Code Review (dedicated pass → scope → per-bucket fan-out → synthesize)...');
  let srResult = null;
  let lensBlocking = [];
  await tokenedStage('Code Review', async () => {
    // (a) DEDICATED gate pass — owns decision-fidelity + regression-vs-baseline.
    srResult = await safeAgent('general-purpose',
      'You are a senior reviewer. Review the developer\'s uncommitted changes against the approved plan.\n' +
      'Handoff plan: ' + handoffPath + decisionsBlock + baselineBlock + DISCOVER +
      '\nDecision fidelity (mandatory): for EACH decision above, verify the diff implements it; any ' +
      'unimplemented decision NOT documented in BOTH `### Deviations From Plan` AND `### Risks or ' +
      'Follow-Ups` is a P1.\nRegression (mandatory): any test failure NOT in the baseline list is a P0.\n' +
      'Judge change CONTENT only — ignore uncommitted/dirty state.\n\n' +
      'Your FINAL action MUST be a call to the StructuredOutput tool with the required schema.',
      { label: 'code:dedicated#' + round, phase: 'Code Review', schema: CODE_DEDICATED_SCHEMA });

    if (srResult && srResult.verdict === 'Pass' && srResult.p0_p1_findings.length === 0) {
      // (b) SCOPE the diff into review buckets (Worked example A, step 1).
      const scope = await safeAgent('general-purpose',
        'Read-only scoping task. Confirm the diff range `' + RANGE + '`, then bucket the changed files ' +
        'into at most ' + MAX_GROUPS + ' review groups by top-level package/dir. For each group return an ' +
        'EXACT runnable diffCommand of the form `git diff ' + RANGE + ' -- <paths>`. Return the structured scope.',
        { label: 'code:scope#' + round, phase: 'Code Review', schema: SCOPE_SCHEMA });
      const groups = (scope && Array.isArray(scope.groups)) ? scope.groups : [];

      // (c) FAN OUT one reviewer per bucket, in parallel (Worked example A, step 2).
      const reviews = (await parallel(groups.map((g) => () =>
        safeAgent('general-purpose',
          'Review bucket "' + g.key + '". Why/what to scrutinise: ' + g.rationale + '\nSee its diff:\n  ' +
          g.diffCommand + '\nRead the FULL current version of any non-trivial changed file, not just the ' +
          'hunks.' + DISCOVER + '\nReport findings per the schema. Set group = "' + g.key + '".\n\n' +
          'Your FINAL action MUST be a call to the StructuredOutput tool.',
          lensOpts({ label: g.label || ('review:' + g.key), phase: 'Code Review', schema: BUCKET_FINDINGS_SCHEMA })))
      )).filter(Boolean);

      // (d) SYNTHESIZE the cross-cutting pass no single bucket can see (Example A, step 3).
      const synthesis = groups.length ? await safeAgent('general-purpose',
        'You are the LEAD reviewer consolidating ' + reviews.length + ' per-bucket reports for range ' +
        (scope.range || RANGE) + '. Trace any data/control flow that spans buckets and confirm it is ' +
        'coherent (contracts, enums, types, security properties hold end to end). Output ONLY net-new ' +
        'cross-cutting findings; set group = "cross-cutting".' + DISCOVER + '\n\n' + JSON.stringify(reviews, null, 2) +
        '\n\nYour FINAL action MUST be a call to the StructuredOutput tool.',
        { label: 'code:synthesis#' + round, phase: 'Code Review', schema: BUCKET_FINDINGS_SCHEMA }) : null;

      const all = [...reviews, ...(synthesis ? [synthesis] : [])];
      lensBlocking = dedupeFindings(all.flatMap((r) => (r && r.findings) || [])).filter(isBlocking);
    } else {
      log('Dedicated code pass not clean — skipping the fan-out this round (gate-first).');
    }
  });

  if (!srResult) {
    log('code dedicated pass returned null — treating as Fail.');
    if (round === MAX_DEV) throw new Error('Code review failed after ' + MAX_DEV + ' rounds (null reviewer).');
    continue;
  }

  log('Code review verdict: ' + srResult.verdict + ' | Dedicated P0/P1: ' + srResult.p0_p1_findings.length +
      ' | Fan-out P0/P1: ' + lensBlocking.length);

  if (srResult.verdict === 'Pass' && srResult.p0_p1_findings.length === 0 && lensBlocking.length === 0) {
    codeApproved = true;
    log('Code review passed. Implementation is ready to commit.');
    break;
  }

  const merged = [
    ...srResult.p0_p1_findings.map((f) => '- ' + f),
    ...lensBlocking.map((f) => '- [' + f.severity + '] ' + (f.title || f.finding) + (f.location ? ' (' + f.location + ')' : '')),
  ];
  codeFindings = merged.length ? merged.join('\n') : srResult.findings.map((f) => '- ' + f).join('\n');
  if (round === MAX_DEV) throw new Error('Code review failed after ' + MAX_DEV + ' rounds.\n\nLast P0/P1 findings:\n' + codeFindings);
}

if (!codeApproved) throw new Error('Development loop exited without a Pass verdict.');

// ════════════════════════════════════════════════════════════════════════════════
//  Phase 5 — Summary (commit prompt + stats)
// ════════════════════════════════════════════════════════════════════════════════
phase('Summary');
log('All gates passed. Implementation is approved and ready for the user to commit.');

return {
  status: 'approved',
  next_action: 'ask_user_to_commit',
  startStage: START,
  handoffDoc: handoffPath,
  decisions: collectedDecisions,
  baseline_failures: baselineFailures,
  designRounds,
  devRounds,
  agentRuns: roleRuns,
  stageTokens,
  totalOutputTokens: budget.spent(),
  note: 'Tokens are reported PER STAGE (concurrent fan-out shares the budget window, so per-agent ' +
        'tokens are not separable). Run counts are per role. See /workflows for live timing.',
  commit_suggestion: {
    type_scope: 'feat(' + featureSlug + ')',
    review_commands: ['git status --short', 'git diff'],
    commit_command_template: 'git commit -m "feat(' + featureSlug + '): <summary>"',
  },
  message:
    'SDLC workflow complete. The calling agent MUST now ask the user (via AskUserQuestion) whether to ' +
    'commit, amend, or discard. Do NOT auto-commit.\n\nReview commands:\n  git status --short\n  git diff\n\n' +
    'Suggested commit:\n  git commit -m "feat(' + featureSlug + '): <your summary>"\n\nHandoff doc: ' + handoffPath,
};
