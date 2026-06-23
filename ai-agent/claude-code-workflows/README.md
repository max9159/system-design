<!-- omit in toc -->
# Designing AI Agents with Dynamic Workflows on Claude Code

> **A practical introduction to *dynamic workflows* — the orchestration layer that lets Claude Code write its own harness on the fly, fan out tens to hundreds of sub-agents in a single session, and verify its own work before handing it back.**

This doc explains *what* dynamic workflows are, *why* they exist, *how* the script API works, the **six reusable patterns**, and a set of **annotated JavaScript examples** drawn from production workflows. It is written for engineers designing multi-agent systems on top of Claude Code.

Sources: [*A harness for every task: dynamic workflows in Claude Code*](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code), the UltraCode walkthrough, and two real workflow scripts (`dev-pipeline`, `code-review-fanout`).

> 中文版（繁體）：[`claude-code-dynamic-workflows-design.zh-TW.md`](./claude-code-dynamic-workflows-design.zh-TW.md)

- [1. The problem: one context window is a bad harness for big tasks](#1-the-problem-one-context-window-is-a-bad-harness-for-big-tasks)
- [2. Three ways to coordinate agents — and how workflows differ](#2-three-ways-to-coordinate-agents--and-how-workflows-differ)
- [3. UltraCode = extra-high effort + dynamic workflows](#3-ultracode--extra-high-effort--dynamic-workflows)
- [4. How Claude builds a workflow: analyze → plan → execute → synthesize](#4-how-claude-builds-a-workflow-analyze--plan--execute--synthesize)
- [5. Anatomy of a workflow script](#5-anatomy-of-a-workflow-script)
  - [5.1 The required `meta` block](#51-the-required-meta-block)
  - [5.2 The orchestration hooks](#52-the-orchestration-hooks)
  - [5.3 Ambient globals](#53-ambient-globals)
  - [5.4 The golden rule: `pipeline()` by default, `parallel()` only at a true barrier](#54-the-golden-rule-pipeline-by-default-parallel-only-at-a-true-barrier)
- [6. The six workflow patterns](#6-the-six-workflow-patterns)
  - [Pattern 1 — Fan-out \& synthesize](#pattern-1--fan-out--synthesize)
  - [Pattern 2 — Classify \& act](#pattern-2--classify--act)
  - [Pattern 3 — Adversarial verification](#pattern-3--adversarial-verification)
  - [Pattern 4 — Generate \& filter](#pattern-4--generate--filter)
  - [Pattern 5 — Tournament](#pattern-5--tournament)
  - [Pattern 6 — Loop until done](#pattern-6--loop-until-done)
- [7. Worked example A — a generic code-review fan-out](#7-worked-example-a--a-generic-code-review-fan-out)
- [8. Worked example B — a gated SDLC pipeline (fan-out + adversarial + loop)](#8-worked-example-b--a-gated-sdlc-pipeline-fan-out--adversarial--loop)
- [9. Structured output: the contract between code and model](#9-structured-output-the-contract-between-code-and-model)
- [10. Cost \& control — running workflows without burning 2M tokens](#10-cost--control--running-workflows-without-burning-2m-tokens)
- [11. A design checklist for your own workflows](#11-a-design-checklist-for-your-own-workflows)
- [12. How to run](#12-how-to-run)
  - [TL;DR](#tldr)

---

## 1. The problem: one context window is a bad harness for big tasks

A single Claude Code agent runs everything in one context window. That works for small, linear tasks. On large, multi-part work it hits three predictable failure modes:

| Failure mode | What it looks like |
| --- | --- |
| **Agentic laziness** | Claude stops early on a sprawling task — "I fixed the main ones" — instead of finishing all of it. |
| **Self-preferential bias** | Asked to verify its own output, it prefers its own answer and waves the check through. |
| **Goal drift** | Across many turns it slowly loses fidelity to the original objective. |

The root cause is structural: **one context, one perspective, one pass.** A generic harness can't fix that. The fix is to let Claude *write a harness specific to the task* — one that splits the work across many independent context windows, runs them in parallel, and pits verifiers against producers.

---

## 2. Three ways to coordinate agents — and how workflows differ

| Approach | Topology | Communication | Re-runnable? |
| --- | --- | --- | --- |
| **Sub-agents** | Parent → child. Orchestrator spins up a child, gets a result, done. | One-shot, parent↔child only. | No — ad hoc each time. |
| **Agent teams** | Manager → peers that talk to each other (builder ↔ QA ↔ reviewer) working the same project simultaneously. | Peer-to-peer, live. | No. |
| **Dynamic workflows** | A single **executable script** that spawns sub-agents, aggregates results, and applies loops / conditions / map / filter — all written down *before* execution. | Via the script's control flow (return values, not chatter). | **Yes** — it's a file you can save, parameterize, and re-invoke. |

Visually, the three differ in **who coordinates** and **who talks to whom**:

```text
  (1) SUB-AGENTS                 (2) AGENT TEAMS                (3) DYNAMIC WORKFLOWS
      parent → child                 manager → peers                script → agents
      one-shot, isolated             live, talk to each other       deterministic control flow

      ┌─────────────┐                ┌─────────────┐                ┌───────────────────────────┐
      │ Orchestrator│                │ Team manager│                │  workflow.js              │
      └──┬───┬───┬──┘                └──────┬──────┘                │  phase()·parallel()       │
   spawn │   │   │                 spins up │ a team                │  ·pipeline()·loop·gate    │
    ┌────┘   │   └────┐            ┌─────────┼─────────┐             └──┬─────────┬─────────┬────┘
    ▼        ▼        ▼            ▼         ▼         ▼            spawn│         │         │loop
 ┌─────┐ ┌─────┐ ┌─────┐      ┌──────┐  ┌──────┐  ┌──────┐             ▼         ▼         ▼
 │sub A│ │sub B│ │sub C│      │Builder│◄►│  QA  │◄►│Review│        ┌──────┐  ┌──────┐ ┌────────┐
 └──┬──┘ └──┬──┘ └──┬──┘      └──┬───┘  └──┬───┘  └───┬──┘        │agent │  │agent │ │verifier│
    └───────┼───────┘            └─────────┼─────────┘            └──┬───┘  └──┬───┘ └───┬────┘
            ▼                     shared working state                └─ return ┴ values ─┘
       results back           (peers talk live, concurrently)                   ▼
                                                                       synthesize → main session

  no peer talk · ad-hoc      live peer-to-peer ·               agents don't talk; the SCRIPT
  · not saved                 not a re-runnable file            routes their return values ·
                                                                saved · parameterized · re-runnable
```

- **Sub-agents** — the orchestrator fans out children, each runs in isolation and returns once. No coordination between them; nothing is saved for next time.
- **Agent teams** — a manager spins up peers that **communicate live** and work the same project concurrently (builder ↔ QA ↔ reviewer), sharing working state. Powerful, but it's a live arrangement, not a file you re-run.
- **Dynamic workflows** — a **script** is the coordinator. Agents never talk to each other; the *JavaScript control flow* routes their return values, applies loops/gates/filters, and synthesizes — and because it's a file, you save, parameterize, and re-invoke it.

The key distinction: a dynamic workflow is **deterministic orchestration around non-deterministic agents.** The control flow (what fans out, what gates, what loops) lives in plain JavaScript. The judgement (reading code, finding bugs, writing a plan) lives in the sub-agents. You get the reliability of code where you want reliability, and model intelligence where you want intelligence.

---

## 3. UltraCode = extra-high effort + dynamic workflows

`/effort` sets a Claude Code session's effort tier: `low · medium · high · ultracode`. **UltraCode** is simply:

```
UltraCode  =  extra-high thinking effort  +  dynamic workflows (on by default)
```

You don't *need* UltraCode to run a workflow. Including the keyword **`workflow`** (or **`ultracode`**) in any prompt at any effort tier tells Claude Code to author and run one. UltraCode just makes workflows the standing default and turns the thinking ceiling all the way up — which is why it costs the most (the demo in the source spent ~2M tokens / ~11 min on one comment-analysis run).

Practical rule: reach for a workflow when the task is **wide** (many files / many angles) or needs **independent verification**. Stay solo for small linear edits.

---

## 4. How Claude builds a workflow: analyze → plan → execute → synthesize

```
  prompt  ─►  ANALYZE          understand intent & scope
             │
             ▼
             PLAN              write a JS script with loops / conditions / map / filter
             │
             ▼
             EXECUTE           spawn sub-agents (parallel / pipelined), gate, loop
             │
             ▼
             SYNTHESIZE        aggregate findings back to the main session
```

The middle is a real script. Everything below is the API that script is written against.

---

## 5. Anatomy of a workflow script

A workflow is **plain JavaScript** (not TypeScript — no type annotations, interfaces, or generics). It runs in an async context, so you `await` directly. `Date.now()`, `Math.random()`, and argless `new Date()` are **disabled** (they'd break resumability — pass timestamps via `args` instead).

### 5.1 The required `meta` block

Every script starts with a **pure literal** `meta` object — no variables, calls, or interpolation:

```js
export const meta = {
  name: 'find-flaky-tests',
  description: 'Find flaky tests and propose fixes',   // shown in the permission dialog
  phases: [                                            // one entry per phase() you call
    { title: 'Scan', detail: 'grep CI logs for retry markers' },
    { title: 'Fix',  detail: 'one agent per flaky test' },
  ],
};
// script body starts here
```

### 5.2 The orchestration hooks

| Hook | Signature | What it does |
| --- | --- | --- |
| `agent(prompt, opts?)` | `=> Promise<any>` | Spawn one sub-agent. Returns its final text as a string — **or**, with `opts.schema`, a validated object. |
| `parallel(thunks)` | `=> Promise<any[]>` | Run tasks concurrently. **Barrier** — awaits all. A failed thunk resolves to `null`. |
| `pipeline(items, ...stages)` | `=> Promise<any[]>` | Run each item through all stages independently — **no barrier between stages**. |
| `phase(title)` | `void` | Start a new progress group; later `agent()` calls are filed under it. |
| `log(msg)` | `void` | Emit a narrator line to the user (visible in `/workflows`). |

`agent()` options:

```js
agent(prompt, {
  label:     'review:auth',     // display label in the progress tree
  phase:     'Review',          // assign to a progress group (use inside parallel/pipeline)
  schema:    FINDINGS_SCHEMA,    // JSON Schema → forces StructuredOutput, returns a validated object
  model:     'sonnet',          // per-agent model override (omit to inherit the session model)
  agentType: 'senior-reviewer', // use a custom sub-agent type from the registry
  isolation: 'worktree',        // run in a fresh git worktree (EXPENSIVE — only for parallel writers)
})
```

### 5.3 Ambient globals

| Global | Use |
| --- | --- |
| `args` | The value passed as the Workflow tool's `args`, verbatim. Parameterizes the workflow. |
| `budget.total` | The turn's token target (`null` if none set). |
| `budget.spent()` | Output tokens spent this turn (shared across main loop + all workflows). |
| `budget.remaining()` | `max(0, total − spent())`, or `Infinity` if no target. |
| `workflow(name, args?)` | Run another saved workflow inline as a sub-step (one level deep). |

### 5.4 The golden rule: `pipeline()` by default, `parallel()` only at a true barrier

`parallel()` is a **barrier** — it waits for every thunk before returning. That wastes wall-clock when the slowest task is 3× the fastest. `pipeline()` lets item A reach stage 3 while item B is still in stage 1.

```js
// ❌ Needless barrier: a transform sits between two parallel stages
const a = await parallel(items.map(...));
const b = a.flat().filter(Boolean);     // no cross-item dependency
const c = await parallel(b.map(...));

// ✅ Same logic as a pipeline — no synchronization point
const c = await pipeline(items, stageA, r => transform([r]).flat(), stageB);
```

Use a **barrier only** when stage N genuinely needs *all* of stage N−1 at once: dedup/merge across the full set, an early-exit on total count (`0 bugs → skip verify`), or a prompt that references "the other findings."

---

## 6. The six workflow patterns

![The six dynamic workflow patterns: fan-out & synthesize, classify & act, adversarial verification, generate & filter, tournament, and loop until done.](./claude-six-workflow-patterns.png)

These are the composable building blocks. Real workflows mix several.

### Pattern 1 — Fan-out & synthesize

Split work into independent slices, run them in parallel, merge the results. The bread-and-butter pattern.

```js
phase('Review');
const results = await parallel(
  buckets.map((b) => () =>
    agent(`Review the diff for ${b.label}. Report P0–P3 findings.`,
      { label: `review:${b.key}`, phase: 'Review', schema: FINDINGS_SCHEMA })
  )
);

phase('Synthesize');
const synthesis = await agent(
  `Consolidate these ${results.length} reports and find cross-cutting issues no single ` +
  `bucket could see:\n\n${JSON.stringify(results.filter(Boolean), null, 2)}`,
  { label: 'synthesis', phase: 'Synthesize', schema: FINDINGS_SCHEMA }
);
```

### Pattern 2 — Classify & act

Route each task to the right specialist based on its type.

```js
const triaged = await agent(`Classify this issue: bug | feature | docs | infra.`,
  { schema: CLASSIFY_SCHEMA });

const handler = {
  bug:     'Reproduce, find root cause, propose a fix.',
  feature: 'Draft a design doc with trade-offs.',
  docs:    'Write the missing documentation.',
  infra:   'Audit the pipeline config and propose changes.',
}[triaged.type];

const result = await agent(handler, { agentType: triaged.type, label: `act:${triaged.type}` });
```

### Pattern 3 — Adversarial verification

The antidote to self-preferential bias: spawn **independent skeptics** prompted to *refute* a finding, and keep it only if it survives a majority.

```js
async function survivesScrutiny(claim) {
  const votes = await parallel(
    Array.from({ length: 3 }, () => () =>
      agent(`Try to REFUTE this claim by reading the actual code: "${claim}". ` +
            `Default to refuted=true if uncertain.`, { schema: VERDICT_SCHEMA })
    )
  );
  return votes.filter(Boolean).filter((v) => !v.refuted).length >= 2;
}
```

A stronger variant gives each verifier a **distinct lens** (correctness / security / does-it-reproduce) so diversity catches failure modes that three identical skeptics would all miss.

### Pattern 4 — Generate & filter

Generate many candidates, then keep only those that pass a rubric.

```js
const ideas = (await parallel(
  Array.from({ length: 8 }, (_, i) => () =>
    agent(`Propose optimization #${i + 1} for the hot path. One idea, with a cost estimate.`,
      { schema: IDEA_SCHEMA })
  )
)).filter(Boolean);

const kept = (await parallel(
  ideas.map((idea) => () =>
    agent(`Score this idea on impact vs. risk. Keep only if impact=high and risk≤medium:\n` +
          JSON.stringify(idea), { schema: SCORE_SCHEMA })
  )
)).filter((s) => s && s.keep);
```

### Pattern 5 — Tournament

N agents attempt the *same* task from different angles; judges score them; you synthesize from the winner while grafting the best ideas from runners-up. Beats one-attempt-iterated when the solution space is wide.

```js
const attempts = await parallel(
  ['mvp-first', 'risk-first', 'user-first'].map((angle) => () =>
    agent(`Design the feature with a ${angle} approach.`, { label: `attempt:${angle}`, schema: DESIGN_SCHEMA })
  )
);

const scores = await parallel(
  attempts.filter(Boolean).map((a) => () =>
    agent(`Score this design 1–10 on feasibility, simplicity, and coverage:\n${JSON.stringify(a)}`,
      { schema: JUDGE_SCHEMA })
  )
);
// pick the top-scored attempt, then synthesize a final from it + runner-up ideas
```

### Pattern 6 — Loop until done

For unknown-size discovery, keep going until a stopping condition — a target count, a budget, or **K dry rounds**.

```js
// Loop-until-dry: stop after 2 consecutive rounds that surface nothing new.
const seen = new Set();
let dry = 0;
while (dry < 2) {
  const found = (await parallel(
    FINDERS.map((f) => () => agent(f.prompt, { phase: 'Find', schema: BUGS_SCHEMA }))
  )).filter(Boolean).flatMap((r) => r.bugs);

  const fresh = found.filter((b) => !seen.has(key(b)));   // dedup vs ALL seen, in plain JS
  if (!fresh.length) { dry++; continue; }
  dry = 0;
  fresh.forEach((b) => seen.add(key(b)));
}
```

Budget-scaled variant — guard on `budget.total`, or `remaining()` is `Infinity` and you run to the agent cap:

```js
const bugs = [];
while (budget.total && budget.remaining() > 50_000) {
  const r = await agent('Find bugs in this codebase.', { schema: BUGS_SCHEMA });
  bugs.push(...r.bugs);
  log(`${bugs.length} found, ${Math.round(budget.remaining() / 1000)}k tokens left`);
}
```

---

## 7. Worked example A — a generic code-review fan-out

> 📦 **Runnable file.** This example ships as its own standalone workflow:
> [`.claude/workflows/code-review-fanout.js`](./.claude/workflows/code-review-fanout.js) — a
> review-only fan-out with no SDLC gates or loop. (The same **scope → per-bucket fan-out →
> synthesize** pattern is *also* embedded inside [`/sdlc-workflow`](./.claude/workflows/sdlc-workflow.js)'s
> **Code Review** gate; this file is the case where you want the fan-out on its own.) Copy it to your
> user-level workflows dir and it's available in every project:
> ```bash
> cp ai-agent/.claude/workflows/code-review-fanout.js ~/.claude/workflows/   # macOS / Linux
> ```
> ```powershell
> Copy-Item ai-agent\.claude\workflows\code-review-fanout.js $HOME\.claude\workflows\   # Windows
> ```
> Then run it from any session as **`/code-review-fanout`** (see [§12](#12-how-to-run)).

This is a real, reusable workflow: point it at any diff and it scopes → reviews in parallel → synthesizes cross-cutting issues → reports cost. It composes **fan-out & synthesize** with a self-scoping first stage.

**How the agents run** — one scoper, then N reviewers *at the same time*, then one synthesizer:

```text
          your diff (main...HEAD)
                   │
        ┌──────────▼──────────┐
        │  Scope  (1 agent)   │   reads the diff, buckets changed files by package/dir
        └──────────┬──────────┘
                   │ groups = [api, web, db, …]
       ┌───────────┼───────────┬───────────┐      ◄── all run CONCURRENTLY (parallel barrier)
       ▼           ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │review: │  │review: │  │review: │  │review: │   each reviewer sees only its own
   │  api   │  │  web   │  │   db   │  │  …     │   bucket → small context, sharp review
   └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘
       │ P0–P3     │ P0–P3     │ P0–P3     │ P0–P3
       └───────────┴─────┬─────┴───────────┘
                         ▼
              ┌─────────────────────┐
              │ Synthesize (1 agent)│   cross-cutting pass: contracts/enums/security
              │  + Usage (no agent) │   that span buckets; reports token spend
              └──────────┬──────────┘
                         ▼
            consolidated report → main session
```

```js
export const meta = {
  name: 'code-review-fanout',
  description: 'Scope a diff, fan out one reviewer per bucket, synthesize cross-cutting findings.',
  phases: [
    { title: 'Scope',      detail: 'one agent resolves the diff range and buckets changed files' },
    { title: 'Review',     detail: 'one reviewer per bucket, in parallel, P0–P3 findings' },
    { title: 'Synthesize', detail: 'one cross-cutting consolidation pass' },
    { title: 'Usage',      detail: 'report this run’s token spend' },
  ],
};

// Capture the shared meter at the start so Usage can report this run's delta.
const startSpent = budget.spent();

// A bare string is shorthand for { base: "<string>" }.
const a = (typeof args === 'string') ? { base: args } : (args || {});
const RANGE = `${a.base || 'main'}...${a.head || 'HEAD'}`;
const MAX_GROUPS = Number.isFinite(a.maxGroups) ? a.maxGroups : 6;

// ── Phase 1: Scope (one read-only agent buckets the change) ──────────────
phase('Scope');
const scope = await agent(
  `Read-only scoping task. Confirm the diff range ${RANGE}, then bucket the changed files ` +
  `into at most ${MAX_GROUPS} review groups by top-level package/dir. For each group return an ` +
  `EXACT runnable diffCommand. Detect changed submodules and give each its own bucket.`,
  { label: 'scope', phase: 'Scope', agentType: 'senior-reviewer', schema: SCOPE_SCHEMA }
);

const groups = (scope && scope.groups) || [];
if (!groups.length) {
  log(`No changes for ${scope?.range || RANGE}. Nothing to review.`);
  return { status: 'no_changes', range: scope?.range || RANGE };
}
log(`${groups.length} review bucket(s): ${groups.map((g) => g.key).join(', ')}`);

// ── Phase 2: Review (one reviewer per bucket, in PARALLEL) ───────────────
phase('Review');
const reviews = (await parallel(
  groups.map((g) => () =>
    agent(
      `Review bucket "${g.key}". See its diff: ${g.diffCommand}\n` +
      `Read the full changed files, not just the hunks. Report P0–P3 findings.`,
      { label: g.label, phase: 'Review', agentType: 'senior-reviewer', schema: FINDINGS_SCHEMA }
    ).then((r) => (r ? { ...r, key: g.key } : null))
  )
)).filter(Boolean);

// ── Phase 3: Synthesize (the cross-cutting pass one bucket can't do) ─────
phase('Synthesize');
const synthesis = await agent(
  `You are the LEAD reviewer consolidating ${reviews.length} reports for ${scope.range}. ` +
  `Trace any data/control flow that spans buckets and confirm it is coherent. Output ONLY ` +
  `net-new cross-cutting findings.\n\n${JSON.stringify(reviews, null, 2)}`,
  { label: 'synthesis', phase: 'Synthesize', agentType: 'senior-reviewer', schema: FINDINGS_SCHEMA }
);

// ── Phase 4: Usage (no agent — just report the delta) ────────────────────
phase('Usage');
const outputTokensThisRun = budget.spent() - startSpent;
log(`Output tokens this run: ${outputTokensThisRun.toLocaleString()}`);

return { status: 'reviewed', range: scope.range, reviews, synthesis,
         tokenUsage: { outputTokensThisRun, budgetTotal: budget.total } };
```

**Design notes worth stealing:**

- **Self-scoping.** The Scope agent *discovers* the changed files and groups them — nothing is hardcoded, so the same script reviews any branch.
- **One reviewer per bucket, in parallel.** Each gets only its slice → smaller context, sharper review, no cross-talk.
- **A synthesis pass sees what buckets can't.** Contract written in one package and read in another; an enum that drifted across two modules. This is the payoff of splitting *and then re-joining*.
- **`.filter(Boolean)` everywhere.** A flaky sub-agent resolves to `null`, not a crash — one bad agent never discards the whole run's tokens.
- **Usage phase has no agent.** It just reads `budget.spent()`. Always tell the user what a wide fan-out cost.

---

## 8. Worked example B — a gated SDLC pipeline (fan-out + adversarial + loop)

> 📦 **This *is* [`/sdlc-workflow`](./.claude/workflows/sdlc-workflow.js).** The snippet below is the
> abbreviated teaching version; the downloadable file is the complete, runnable script — generic
> (reviewers discover the repo's own `AGENTS.md` / `.claude/rules/`), with all schemas, resilient
> `safeAgent` wrappers, bounded loops, an Open-Questions pause, and `startStage` resume support.

The richer pattern: a full requirement-to-commit pipeline with an **independent review gate** after design and after code, each looping back to its producer on failure. This is where the patterns compose.

**How the agents run** — readers fan out, a single writer produces, and each gate can loop back:

```text
  requirement
      │
      ▼
  ┌────────────────────── [Analyze] ─────────────────────────┐
  │  analysts × N vectors (parallel, RO)                     │
  │    scope · reuse · schema · edge-cases · tests           │
  │  1 synthesis writer ──► handoff doc                      │
  └──────────┬───────────────────────────────────────────────┘
    handoff  │                   Design fail ▲ ──► back to [Analyze]
             │                               │     (≤ maxDesignRounds)
             ▼                               │
  ┌──────────────────── [Design Review] ─────────────────────┐
  │  design-reviewer dedicated  (OQ gate + decisions)        │
  │    └ if Ready: ×N lenses (parallel, RO)                  │
  │  merge + dedupe → (gate)                                 │
  └──────────┬───────────────────────────────────────────────┘
    pass &   │                          
    handoff  │                              
             ▼                                                
  ┌──────────────────── [Development] ───────────────────────┐
  │  baseline capture (pre-dev tests)                        │ 
  │  developer (SINGLE writer) ──► working tree              │        
  └──────────────────────────────────────────────────────────┘       
    handoff  │              Code Review fail ▲ ──► back to [Development]
             │                               │     (≤ maxDevRounds)
             ▼                               │
  ┌──────────────────── [Code Review] ───────────────────────┐        
  │  1 diff capture (RO)                                     │        
  │  senior-reviewer dedicated  (fidelity + regression)      │        
  │    └ if Pass: scope diff → N bucket reviewers            │        
  │       (parallel, RO) → synthesize  (example A)           │        
  │  merge + dedupe → (gate)                                 │        
  └──────────┬───────────────────────────────────────────────┘        
        pass │                         
             ▼
  ┌──────────────────────── [Summary] ───────────────────────┐
  │  commit prompt + per-role / per-stage stats              │
  │  → main agent asks the user to commit                    │
  └──────────────────────────────────────────────────────────┘
```

Each gate runs the **cheap dedicated pass alone first**; the expensive parallel fan-out runs *only to confirm* a clean verdict, and a failure loops straight back to the producer (bounded, so it always terminates).

```js
export const meta = {
  name: 'sdlc-workflow',
  description: 'Analyze → Design Review (gate) → Develop → Code Review (gate) → Summary.',
  phases: [
    { title: 'Analyze',       detail: 'parallel research vectors → one synthesis writer' },
    { title: 'Design Review', detail: 'dedicated gate pass + parallel lenses; fail loops back' },
    { title: 'Development',    detail: 'capture baseline, then ONE developer writes the code' },
    { title: 'Code Review',    detail: 'dedicated gate pass + parallel lenses; fail loops back' },
    { title: 'Summary',        detail: 'submodule check + commit prompt + stats' },
  ],
};

const MAX_DESIGN = 3, MAX_DEV = 3;

// ── Analyze: fan out READ-ONLY analysts → a SINGLE writer ────────────────
phase('Analyze');
const notes = await parallel(
  ANALYSIS_VECTORS.map((v) => () =>
    agent(`Analyze ONLY the "${v.prompt}" dimension against the actual source (cite file:line). ` +
          `Write nothing — return structured notes.`,
      { phase: 'Analyze', label: `analyze:${v.key}`, schema: NOTES_SCHEMA })
  )
);
// ONE writer composes the handoff doc from all the notes — no write contention.
await agent(`Synthesize these per-dimension notes into a design doc and WRITE it to ${handoffPath}:\n` +
            JSON.stringify(notes, null, 2), { phase: 'Analyze', label: 'analyze:synthesize' });

// ── Design Review: GATE-FIRST. Dedicated pass alone; lenses only confirm. ─
let designReady = false;
for (let round = 1; round <= MAX_DESIGN && !designReady; round++) {
  const dedicated = await safeAgent('design-reviewer',
    `Review ${handoffPath}. Verify every file:line claim and all invariants. Return a verdict.`,
    { label: `design:dedicated#${round}`, phase: 'Design Review', schema: DESIGN_REVIEW_SCHEMA });

  // Only fan out the expensive lenses when the cheap gate already says Ready.
  let lensBlocking = [];
  if (dedicated && dedicated.verdict === 'Ready') {
    const lenses = await parallel(DESIGN_LENSES.map((l) => () =>
      safeAgent('design-reviewer', `Review ${handoffPath} through ONE lens: "${l.prompt}". P0–P3.`,
        { label: `design:${l.key}#${round}`, phase: 'Design Review', schema: LENS_SCHEMA })));
    lensBlocking = dedupeFindings(lenses.filter(Boolean).flatMap((r) => r.findings))
      .filter((f) => f.severity === 'P0' || f.severity === 'P1');
  } else {
    log('Dedicated pass not Ready — skipping lens fan-out this round (gate-first).');
  }

  if (dedicated?.verdict === 'Ready' && lensBlocking.length === 0) { designReady = true; break; }
  // else: feed merged findings into the next Analyze revise round (loop back)
  if (round === MAX_DESIGN) throw new Error('Design failed after 3 rounds.');
}

// ── Development: a SINGLE writer (parallel devs would clobber the tree) ───
phase('Development');
await agent(`Implement the approved design at ${handoffPath}. Smallest complete change. Do NOT commit.`,
  { label: 'developer', phase: 'Development', agentType: 'developer' });

// ── Code Review: same gate-first shape, loops back to the developer ──────
//    (capture the diff ONCE, inject into every reviewer — see notes)
```

**The design principles this encodes — the heart of robust agent orchestration:**

1. **Fan out *readers*, never *writers*.** The risk of concurrency is two agents writing the same file. So Analyze fans out read-only analysts that return notes, and a **single** writer composes the doc. Development stays a single writer for the same reason. (Parallel writers would need `isolation: 'worktree'` + a merge step.)

2. **Gate-first review.** A cheap **dedicated pass** runs *alone* first. The expensive **lens fan-out** runs *only to confirm* a clean verdict — if the dedicated pass already fails, the lenses are skipped and the round loops straight back. You spend the wide fan-out only when it can change the outcome.

3. **A dedicated pass *and* lenses.** Some checks aren't lens-shaped — an Open-Questions gate, decision-fidelity, regression-vs-baseline. One dedicated reviewer owns those; the parallel lenses (correctness, security, tests, simplicity…) add finding *depth*.

4. **Resilient sub-agents.** Every schema call is wrapped (`safeAgent`) so an agent that fails to emit structured output resolves to `null` instead of aborting the run — a `null` gate is treated as *Fail* (loop back), a `null` lens is just dropped. One flaky agent never burns the whole run.

5. **Capture-once, inject-many.** Each Code Review round captures `git diff` **once** and injects it into every reviewer's prompt, instead of letting six concurrent reviewers each re-run `git diff` and re-read the same files (measured ~7.8× redundant reads).

6. **Bounded loops.** Every gate loops back to its producer but is capped (`MAX_DESIGN` / `MAX_DEV`), so the pipeline always terminates.

7. **Verifiable facts over self-reports.** A baseline agent records pre-existing test failures *before* the developer touches anything, so "that failure already existed" is checkable — any failure *not* in the baseline is a P0 regression.

---

## 9. Structured output: the contract between code and model

Plain `agent()` returns a string. Pass a JSON Schema and the sub-agent is *forced* to call a `StructuredOutput` tool; validation happens at the tool layer (the model retries on mismatch) and `agent()` returns a validated object — **no parsing, no regex.** This is what makes deterministic control flow over non-deterministic agents possible.

```js
const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['verdict', 'findings'],
  properties: {
    verdict:  { type: 'string', enum: ['ready', 'changes-required', 'blocked'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'title', 'location'],
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          title:    { type: 'string' },
          location: { type: 'string', description: 'file:line' },
        },
      },
    },
  },
};
```

Now `result.verdict === 'ready'` and `result.findings.filter(f => f.severity === 'P0')` are safe in your control flow. Severities, verdicts, and enums become the **gate conditions** your JavaScript branches on.

---

## 10. Cost & control — running workflows without burning 2M tokens

A wide workflow is powerful and expensive. The levers:

| Lever | How |
| --- | --- |
| **Don't force UltraCode.** | Add the keyword `workflow` at `high` or even `medium` effort. Extra-high thinking is Anthropic's *recommendation*, not a requirement. |
| **Scope tightly.** | Point a workflow at a specific folder / path filter, not the whole repo. Fan width = cost. |
| **Cap the thinking ceiling.** | Set a max reasoning allowance in settings so each agent's thinking is bounded. |
| **Plan in markdown first.** | Have Claude write a strict step-by-step plan to a `.md` file *before* spawning agents — it clarifies intent before any wrong turns. |
| **Clear context between runs.** | Start each workflow run fresh; stale context from the previous run compounds token use. |
| **Cheaper lenses.** | Run parallel review lenses on a cheaper model (`model: 'sonnet'`) while the dedicated decision pass keeps the strong model. |
| **Right concurrency.** | The runtime caps real concurrency at ~`min(16, cores − 2)`; passing 100 items still works, only ~10–16 run at once. Fan list length controls cost, not speed past the cap. |
| **Report the spend.** | A final Usage phase that logs `budget.spent()` keeps cost visible. **No silent caps** — if you truncate to top-N, `log()` what was dropped. |

---

## 11. A design checklist for your own workflows

When authoring a workflow script, work through:

- [ ] **Phases named** in `meta.phases` and matched by `phase()` calls.
- [ ] **`pipeline()` by default**; `parallel()` only where a barrier is genuinely needed.
- [ ] **Readers fan out; writers stay single** (or use `isolation: 'worktree'` + merge).
- [ ] **Schemas** on every agent whose output your control flow branches on.
- [ ] **Gate-first**: cheap check alone, expensive fan-out only to confirm.
- [ ] **Adversarial verification** for anything the model might be biased about — independent skeptics, diverse lenses.
- [ ] **Resilience**: wrap schema calls so `null` (not a throw) on failure; `.filter(Boolean)` before use.
- [ ] **Bounded loops**: every loop has a max-rounds or dry-round or budget guard.
- [ ] **Dedup in plain JS** across the full result set before expensive downstream work.
- [ ] **Capture-once, inject-many** for any shared artifact (a diff, a spec) the agents all need.
- [ ] **Usage reporting** + no silent truncation.
- [ ] **`args`-parameterized** so the script is reusable, with a bare-string shorthand for ergonomics.

---

## 12. How to run

**Install once.** Drop a workflow file into a workflows dir and it becomes a slash command named after its file. Use the user-level dir to make it available in *every* project, or a repo's own `.claude/workflows/` to scope it to that repo:

```bash
# user-level (every project) — macOS / Linux
cp ai-agent/.claude/workflows/code-review-fanout.js ~/.claude/workflows/   # Worked example A
cp ai-agent/.claude/workflows/sdlc-workflow.js      ~/.claude/workflows/   # Worked example B
```
```powershell
# user-level (every project) — Windows
Copy-Item ai-agent\.claude\workflows\code-review-fanout.js $HOME\.claude\workflows\   # Worked example A
Copy-Item ai-agent\.claude\workflows\sdlc-workflow.js      $HOME\.claude\workflows\   # Worked example B
```

**Run them as slash commands.** Each file is invokable as **`/<filename>`**; everything after the command is passed as `args` (a bare string is shorthand — the diff base for A, the requirement for B):

```text
# Worked example A — the standalone code-review fan-out:
/code-review-fanout                       # reviews main...HEAD
/code-review-fanout origin/main           # reviews origin/main...HEAD
/code-review-fanout {"base":"main","head":"feature-x","maxGroups":8}

# Worked example B — the saved SDLC workflow (embeds A inside its Code Review gate):
/sdlc-workflow add rate limiting to the webhook endpoint
/sdlc-workflow {"requirement":"add SSO login","startStage":"design-review"}
/sdlc-workflow {"requirement":"refactor the billing module","maxDevRounds":2,"lensModel":"sonnet"}

# Watch live progress (phases, agents, tokens):
/workflows
```

**Or let Claude author one on the fly** — no saved file needed; just describe the work and include the keyword `workflow` (or raise the tier with `/effort ultracode`):

```text
/effort ultracode
> Help me review every changed file on this branch for bugs.   # "review … every" implies a workflow
> Run a workflow to audit the auth module for security issues. # keyword triggers it at any effort tier
```

Saved workflows live in `.claude/workflows/*.js`. Each is invokable as **`/<filename>`** (or via the `Workflow` tool — `Workflow({ name: "sdlc-workflow", args: {…} })`), and shows up in the `/workflows` dashboard with per-phase agent counts and token spend.

---

### TL;DR

> Dynamic workflows let Claude Code **write a task-specific harness in JavaScript** that fans sub-agents across many context windows, gates producers behind independent verifiers, and loops until done — turning the three single-context failure modes (laziness, self-bias, drift) into structural guarantees. **UltraCode** is just this with extra-high thinking on by default. Design them by fanning out *readers*, keeping *writers* single, gating cheaply before fanning out expensively, verifying adversarially, and reporting what it all cost.
