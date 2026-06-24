<!-- omit in toc -->
# Loop Engineering — Bounded Loop-Back in a Gated SDLC Workflow
> **A focused study of *loop engineering* in dynamic workflows: how a gated pipeline loops a failed gate back to its producer, bounded so it always terminates.**

<!-- omit in toc -->
## 📋 Table of Contents

- [What "loop engineering" means here](#what-loop-engineering-means-here)
- [Worked example — a gated SDLC pipeline (fan-out + adversarial + loop)](#worked-example--a-gated-sdlc-pipeline-fan-out--adversarial--loop)
  - [The loop skeleton](#the-loop-skeleton)
  - [Where each piece of the loop lives](#where-each-piece-of-the-loop-lives)
  - [The one subtle part: "back to Analyze" is a *revise*, not a re-run](#the-one-subtle-part-back-to-analyze-is-a-revise-not-a-re-run)
- [The design principles the loops encode](#the-design-principles-the-loops-encode)
- [Two loop shapes, side by side](#two-loop-shapes-side-by-side)
- [A loop-engineering checklist](#a-loop-engineering-checklist)
- [Provenance \& references](#provenance--references)
  - [Sources](#sources)

---

> **TL;DR.** **In:** a one-line requirement. **Out:** a commit-ready feature. Everything between is the loop detailed below.

## What "loop engineering" means here

A *loop* in a dynamic workflow is plain JavaScript control flow wrapped around non-deterministic agents. **Loop engineering** is making that loop *safe and convergent*: it must make progress each round, have an explicit stopping condition, and carry a hard cap so it always terminates even when the agents misbehave.

This example uses the **gate-and-loop-back** shape — a quality gate that, on failure, feeds its findings back to the producer and re-runs (≤ a max number of rounds). It is Anthropic's **evaluator-optimizer** workflow: *"one LLM call generates a response while another provides evaluation and feedback in a loop"* until a `PASS` verdict ([Building effective agents][bea]; reference impl in the [Anthropic cookbook][cookbook]). It differs from the *loop-until-dry / loop-until-budget* shape used for unknown-size discovery (Pattern 6 in [`claude-code-workflows/README.md`](../claude-code-workflows/README.md#pattern-6--loop-until-done)).

It all sits inside the broader **agentic loop** — *gather context → take action → verify work → repeat* ([Claude Agent SDK][sdk]). The "verify work" step is what makes a loop worth running: *"agents that can check and improve their own output are fundamentally more reliable — they catch mistakes before they compound"* ([Claude Agent SDK][sdk]). The academic lineage: [ReAct][react] (interleaved reasoning + acting), [Self-Refine][selfrefine] (single-LLM generate→critique→refine), [Reflexion][reflexion] (verbal feedback in episodic memory across trials).

---

## Worked example — a gated SDLC pipeline (fan-out + adversarial + loop)
> This doc is extracted from the **dynamic-workflows of Claude** write-up ([`claude-code-workflows/README.md`](../claude-code-workflows/README.md)). The runnable script is the same one: [`/sdlc-workflow`](../claude-code-workflows/.claude/workflows/sdlc-workflow.js).

> 📦 **This *is* [`/sdlc-workflow`](../claude-code-workflows/.claude/workflows/sdlc-workflow.js).** Below is just the *loop skeleton* plus a few annotated fragments — every fragment links to the exact lines in the runnable script. The full file also has all schemas, resilient `safeAgent` wrappers, an Open-Questions pause, and `startStage` resume support.

A full requirement-to-commit pipeline with an **independent review gate** after design and after code, each looping back to its producer on failure.

**How the agents run** — readers fan out, a single writer produces, each gate can loop back:

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

### The loop skeleton

The whole Design stage is **one `for` loop** — Analyze and Design Review both live inside it. `phase()` only labels the progress UI; it is **not** control flow. The "fail → back to Analyze" arrow in the diagram is literally just *the loop running its next iteration*.

```js
// Design stage — sdlc-workflow.js:255-358 (Code Review at :401-494 is the same shape)
for (let round = 1; round <= MAX_DESIGN; round++) {
  phase('Analyze');                              // round 1: fan-out → writer · round ≥2: revise
  phase('Design Review');                        // gate-first: dedicated pass, then lenses confirm

  if (verdict === 'Ready' && lensBlocking.length === 0) { designReady = true; break; }  // ✅ leave loop
  designFindings = /* the reviewer's required changes */;                          // carry feedback
  if (round === MAX_DESIGN) throw new Error('Design approval failed…');            // hard cap
}
```

### Where each piece of the loop lives

| Diagram element | What it does | In `sdlc-workflow.js` |
| --- | --- | --- |
| the loop itself | `for round … MAX_DESIGN` wrapping Analyze **and** Review | [L255](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L255) |
| `Design fail ▲ ──► [Analyze]` | no `break` → next iteration; Analyze runs its **revise** branch | [L263, L278-L284](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L263-L284) |
| feedback carried between rounds | `designFindings` (declared *outside* the loop, written by the gate) | [L251](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L251), [L351-L355](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L351-L355) |
| gate-first | lenses fan out **only if** the dedicated pass says `Ready` | [L305-L319](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L305-L319) |
| pass → leave the loop | `verdict === 'Ready' && lensBlocking.length === 0` → `break` | [L345-L349](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L345-L349) |
| hard cap (always terminates) | last round throws instead of looping forever | [L357](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L357) |

### The one subtle part: "back to Analyze" is a *revise*, not a re-run

Round 1 does the full fan-out; every later round skips it and feeds the gate's findings into a single revise agent — that variable *is* the loop-back ([L278-L284](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L278-L284)):

```js
} else {  // round ≥ 2 — the gate rejected the previous design
  await callAgent('general-purpose',
    'The design-reviewer REJECTED the previous design. … apply ALL required changes below … ' +
    '\n\nRequired changes:\n\n' + designFindings,         // ← findings from the failed gate
    { phase: 'Analyze', label: 'analyze:revise#' + round });
}
```

`Development → Code Review` is the same `for`-loop shape ([L401-L494](../claude-code-workflows/.claude/workflows/sdlc-workflow.js#L401-L494)), with `codeFindings` replacing `designFindings` and the producer editing source instead of the doc.

**The design principles this encodes — the heart of robust agent orchestration:**

1. **Fan out *readers*, never *writers*.** The risk of concurrency is two agents writing the same file. So Analyze fans out read-only analysts that return notes, and a **single** writer composes the doc. Development stays a single writer for the same reason. (Parallel writers would need `isolation: 'worktree'` + a merge step.)

2. **Gate-first review.** A cheap **dedicated pass** runs *alone* first. The expensive **lens fan-out** runs *only to confirm* a clean verdict — if the dedicated pass already fails, the lenses are skipped and the round loops straight back. You spend the wide fan-out only when it can change the outcome.

3. **A dedicated pass *and* lenses.** Some checks aren't lens-shaped — an Open-Questions gate, decision-fidelity, regression-vs-baseline. One dedicated reviewer owns those; the parallel lenses (correctness, security, tests, simplicity…) add finding *depth*.

4. **Resilient sub-agents.** Every schema call is wrapped (`safeAgent`) so an agent that fails to emit structured output resolves to `null` instead of aborting the run — a `null` gate is treated as *Fail* (loop back), a `null` lens is just dropped. One flaky agent never burns the whole run.

5. **Capture-once, inject-many.** Each Code Review round captures `git diff` **once** and injects it into every reviewer's prompt, instead of letting six concurrent reviewers each re-run `git diff` and re-read the same files (measured ~7.8× redundant reads).

6. **Bounded loops.** Every gate loops back to its producer but is capped (`MAX_DESIGN` / `MAX_DEV`), so the pipeline always terminates.

7. **Verifiable facts over self-reports.** A baseline agent records pre-existing test failures *before* the developer touches anything, so "that failure already existed" is checkable — any failure *not* in the baseline is a P0 regression.

---

## The design principles the loops encode

Of the seven principles above, three are **loop-engineering** invariants — the rules that keep a loop-back convergent rather than runaway:

| Principle | Why it is a loop concern |
| --- | --- |
| **6. Bounded loops** | The hard cap (`MAX_DESIGN` / `MAX_DEV`) is the termination guarantee. Without it, a gate that never reaches *Ready* loops forever (or until the 1000-agent backstop). |
| **2. Gate-first** | Controls *cost per iteration*. The cheap dedicated pass decides whether to loop back **before** paying for the wide lens fan-out — so a failing round is cheap. |
| **4. Resilient sub-agents** | Defines loop behavior on partial failure: a `null` gate is treated as *Fail* (loop back, don't crash), a `null` lens is dropped. The loop degrades, it doesn't abort. |

The remaining principles (single-writer, dedicated+lenses, capture-once, baseline) are about *what happens inside* each iteration, not the loop's convergence.

**On the bounded-loop cap.** This isn't a workflow-specific quirk — it's the standard safety mechanism for any agentic loop. Anthropic notes it is *"common to include stopping conditions (such as a maximum number of iterations) to maintain control"* ([Building effective agents][bea]). Production agent runtimes ship the same guard: the OpenAI Agents SDK caps a run with `max_turns` and raises `MaxTurnsExceeded` ([Agents SDK — Running agents][oai-run]); LangGraph caps super-steps with `recursion_limit` (default **25**) and raises `GraphRecursionError` ([LangGraph — recursion limit][langgraph]). There is no published universal value for the cap — pick it per task; `MAX_DESIGN`/`MAX_DEV = 3` here is a deliberately tight default for a single feature.

**Why the gate is *independent*, not the producer self-checking.** The gate-first reviewer is a *separate* agent from the producer on purpose. Self-correction is not reliably accuracy-improving — *"LLMs Cannot Self-Correct Reasoning Yet"* ([Huang et al.][selfcorrect]) shows models often fail to fix their own reasoning without external signal, and LLM-as-judge work documents self-preferential / self-enhancement and position biases ([Zheng et al., MT-Bench][mtbench]). An independent verifier with its own context window (and, in the full script, a refute-by-default prompt) is the loop's external signal — the same reason Anthropic's multi-agent research system gives each subagent its own context and grades outputs with a separate LLM-as-judge ([Multi-agent research system][multiagent]).

---

## Two loop shapes, side by side

This example uses the first shape; the second is the discovery loop from Pattern 6, shown for contrast.

| | **Gate-and-loop-back** (this doc) | **Loop-until-dry / -budget** (Pattern 6) |
| --- | --- | --- |
| **Question it answers** | "Is the producer's output good enough yet?" | "Have we found everything there is to find?" |
| **Stop condition** | A clean verdict (`Ready` + no blocking findings) | K consecutive empty rounds, a target count, or budget |
| **Hard cap** | `MAX_DESIGN` / `MAX_DEV` rounds | `budget.total` guard or the dry-round counter |
| **Each round feeds back** | Findings → the same producer, which revises | Dedup vs *all seen* → only fresh results advance |
| **Failure mode it prevents** | Endless polishing of a doc/diff that can't pass | Stopping early and missing the long tail |

```js
// Gate-and-loop-back (this doc): loop while NOT good enough, capped.
let ready = false;
for (let round = 1; round <= MAX_ROUNDS && !ready; round++) {
  const verdict = await gate(producerOutput);
  if (verdict.pass) { ready = true; break; }
  producerOutput = await producer.revise(verdict.findings);   // feed back
  if (round === MAX_ROUNDS) throw new Error('Failed after max rounds.');
}

// Loop-until-dry (Pattern 6): loop while STILL finding things, K dry rounds.
const seen = new Set();
let dry = 0;
while (dry < 2) {
  const fresh = (await find()).filter((x) => !seen.has(key(x)));
  if (!fresh.length) { dry++; continue; }
  dry = 0;
  fresh.forEach((x) => seen.add(key(x)));
}
```

---

## A loop-engineering checklist

When you wrap a loop around agents, work through:

- [ ] **Explicit stop condition** — a clean verdict, a target count, or K dry rounds. Never "loop until it feels done."
- [ ] **Hard cap** — every loop has a `MAX_ROUNDS` / budget / dry-round guard so it terminates even if agents never converge.
- [ ] **Progress each round** — feed the previous round's findings back into the producer; a round that changes nothing is a bug.
- [ ] **Cheap iterations** — gate-first, so a failing round skips the expensive fan-out (cost per iteration matters when you may iterate N times).
- [ ] **Degrade, don't abort** — a `null`/failed agent resolves to *Fail-and-loop* or *drop*, never an uncaught throw mid-loop.
- [ ] **Dedup across the full set** — when the loop accumulates results, dedup vs *all seen* in plain JS, not vs the last round only.
- [ ] **Surface what the cap dropped** — if you hit `MAX_ROUNDS`, `log()` / `throw` loudly; a silent cap reads as success.

---

## Provenance & references

The concepts above were fact-checked against primary sources (Anthropic engineering/research posts, official OpenAI/LangChain docs, and peer-reviewed NeurIPS/ICLR papers). Verdicts:

| Concept in this doc | Established name / verdict | Primary source |
| --- | --- | --- |
| The wrapping loop | **Agentic loop**: *gather context → take action → verify work → repeat*. ✅ Verbatim | [Claude Agent SDK][sdk], [Effective context engineering][ctx] |
| Gate-and-loop-back / generator-critic | **Evaluator-optimizer** workflow (Anthropic's term). ✅ Established pattern | [Building effective agents][bea], [Anthropic cookbook][cookbook] |
| Bounded loop / hard cap | ✅ Correct; Anthropic calls it *"common…to maintain control"* (not a hard "recommend"). Vendor caps confirm it | [Building effective agents][bea], [OpenAI `max_turns`][oai-run], [LangGraph `recursion_limit`][langgraph] |
| Independent gate over self-checking | ✅ Supported; self-correction is contested, so external verification is preferred | [Huang et al.][selfcorrect], [Zheng et al. MT-Bench][mtbench], [Multi-agent research system][multiagent] |
| Fan out readers, single writer | ✅ Matches orchestrator-worker findings (parallel helps breadth-first; hurts on shared context/interdependencies) | [Multi-agent research system][multiagent], [Cognition: Don't build multi-agents][cognition] |
| "Laziness" / premature completion | ⚠️ Real behavior, but a *colloquial* label — Anthropic documents *"mark a feature complete without proper testing"*, not the word "laziness" | [Effective harnesses for long-running agents][harness] |
| Context degradation over long loops | ✅ "Context rot": recall drops as tokens grow (one factor: n² attention, not the sole cause) | [Effective context engineering][ctx], [Chroma: Context Rot][contextrot], [Lost in the Middle][lostmiddle] |
| Academic basis | ✅ ReAct, Self-Refine, Reflexion are the foundational feedback-loop papers | [ReAct][react], [Self-Refine][selfrefine], [Reflexion][reflexion] |

> **"Loop engineering" is not a recognized term** — it's our framing. Prefer **agentic loop** and **evaluator-optimizer** when talking to others.

### Sources

**Anthropic — engineering & research**
- [Building agents with the Claude Agent SDK][sdk] — Anthropic Engineering
- [Effective context engineering for AI agents][ctx] — Anthropic Engineering
- [Building effective agents][bea] — Anthropic Research (defines the evaluator-optimizer workflow)
- [Effective harnesses for long-running agents][harness] — Anthropic Engineering
- [How we built our multi-agent research system][multiagent] — Anthropic Engineering
- [Anthropic Cookbook — evaluator-optimizer pattern][cookbook] — reference implementation

**Vendor agent runtimes (bounded-loop mechanisms)**
- [OpenAI Agents SDK — Running agents (`max_turns` → `MaxTurnsExceeded`)][oai-run]
- [OpenAI Agents SDK — Guardrails (input/output validation)][oai-guard]
- [LangGraph — `GRAPH_RECURSION_LIMIT` (default 25 → `GraphRecursionError`)][langgraph]

**Peer-reviewed — iterative agent loops & their limits**
- [ReAct: Synergizing Reasoning and Acting in Language Models][react] — Yao et al., ICLR 2023
- [Self-Refine: Iterative Refinement with Self-Feedback][selfrefine] — Madaan et al., NeurIPS 2023
- [Reflexion: Language Agents with Verbal Reinforcement Learning][reflexion] — Shinn et al., NeurIPS 2023
- [Large Language Models Cannot Self-Correct Reasoning Yet][selfcorrect] — Huang et al., ICLR 2024
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena][mtbench] — Zheng et al., NeurIPS 2023 (judge biases)
- [Lost in the Middle: How Language Models Use Long Contexts][lostmiddle] — Liu et al., TACL 2024

**Practitioner / secondary (corroborating)**
- [Designing agentic loops][simonw] — Simon Willison
- [Don't build multi-agents][cognition] — Cognition (shared-context failure mode)
- [Context Rot: empirical degradation with input length][contextrot] — Chroma Research

[sdk]: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
[ctx]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
[bea]: https://www.anthropic.com/research/building-effective-agents
[harness]: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
[multiagent]: https://www.anthropic.com/engineering/multi-agent-research-system
[cookbook]: https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/evaluator_optimizer.ipynb
[oai-run]: https://openai.github.io/openai-agents-python/running_agents/
[oai-guard]: https://openai.github.io/openai-agents-python/guardrails/
[langgraph]: https://docs.langchain.com/oss/python/langgraph/errors/GRAPH_RECURSION_LIMIT
[react]: https://arxiv.org/abs/2210.03629
[selfrefine]: https://arxiv.org/abs/2303.17651
[reflexion]: https://arxiv.org/abs/2303.11366
[selfcorrect]: https://arxiv.org/abs/2310.01798
[mtbench]: https://arxiv.org/abs/2306.05685
[lostmiddle]: https://arxiv.org/abs/2307.03172
[simonw]: https://simonw.substack.com/p/designing-agentic-loops
[cognition]: https://cognition.com/blog/dont-build-multi-agents
[contextrot]: https://research.trychroma.com/context-rot

---

> **Terminology note.** *"Loop engineering"* is this doc's framing, not an established term. The field's vocabulary is the **agentic loop** — Anthropic defines an agent as "LLMs autonomously using tools in a loop," cycling *gather context → take action → verify work → repeat* ([Claude Agent SDK][sdk], [context engineering][ctx]). The *gate-and-loop-back* shape below is Anthropic's named **evaluator-optimizer** workflow ([Building effective agents][bea]). Prefer those canonical names; "gate-and-loop-back" / "generator-critic" are restatements. Every load-bearing claim here is verified against primary sources — see [Provenance & references](#provenance--references).

