# AI Agent

Notes, designs, and runnable artifacts for building AI agents.

## Contents

### 🧩 [`claude-code-workflows/`](./claude-code-workflows/)
Designing AI agents with **dynamic workflows** on Claude Code — the orchestration layer that lets Claude Code write its own harness on the fly, fan out tens to hundreds of sub-agents in a single session, and verify its own work before handing it back.

- **[`claude-code-workflows/README.md`](./claude-code-workflows/README.md)** — the main write-up: what dynamic workflows are, why they exist, how the script API works, the six reusable patterns, and annotated JavaScript examples ([繁體中文版](./claude-code-workflows/claude-code-dynamic-workflows-design.zh-TW.md)).
- **[`claude-code-workflow-ultracode-intro.md`](./claude-code-workflows/claude-code-workflow-ultracode-intro.md)** — a transcript-based intro to UltraCode (extra-high effort + dynamic workflows).
- **[`.claude/workflows/`](./claude-code-workflows/.claude/workflows/)** — two real, runnable workflow scripts:
  - [`code-review-fanout.js`](./claude-code-workflows/.claude/workflows/code-review-fanout.js) — *Worked example A*: scope a diff → one reviewer per bucket (parallel) → synthesize cross-cutting findings.
  - [`sdlc-workflow.js`](./claude-code-workflows/.claude/workflows/sdlc-workflow.js) — *Worked example B*: a gated requirement-to-commit SDLC pipeline (fan-out + adversarial review + loop).
- **[`claude-six-workflow-patterns.png`](./claude-code-workflows/claude-six-workflow-patterns.png)** — the six workflow patterns at a glance.

> To use the workflows, copy the `.js` files into a Claude Code workflows dir (`~/.claude/workflows/` for every project, or a repo's own `.claude/workflows/`) and invoke them as `/code-review-fanout` / `/sdlc-workflow`. See §12 of the design doc for details.

### 📊 [`claude-code-statusline/`](./claude-code-statusline/)
Reproduce a rich, single-line **status bar** at the bottom of every Claude Code session — directory + git branch, model, context-window remaining (with a colored mini-bar), 5h/7d rate-limit remaining, and session cost. Zero dependencies; works on Windows/macOS/Linux.

- **[`claude-code-statusline/README.md`](./claude-code-statusline/README.md)** — the main write-up: what each segment shows, how the `statusLine` command hook works, 2-file setup, verification, gotchas, customizing, and a full reference for the stdin JSON Claude Code pipes to the script.
- **[`statusline.cjs`](./claude-code-statusline/statusline.cjs)** — the runnable status-line script.
- **[`settings.windows.example.json`](./claude-code-statusline/settings.windows.example.json)** / **[`settings.macos-linux.example.json`](./claude-code-statusline/settings.macos-linux.example.json)** — the minimal `statusLine` setting to merge into your config dir's `settings.json`, one per OS.

> Copy `statusline.cjs` into your Claude Code config dir (`~/.claude/`, or a custom `CLAUDE_CONFIG_DIR`), add the `statusLine` key from `settings.example.json` pointing at it, and restart. See the setup guide for details.
