#!/usr/bin/env node
// Claude Code status line:
// <dir> | <branch> │ <Model (effort)> │ ctx:<bar+%> │ 5h:% │ 7d:% │ $cost
// Colors: green ≥50% remaining, yellow 21-49%, red ≤20%. Icons are plain emoji.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw.replace(/^﻿/, '')); } catch {}

  const ICON_CTX = '🪟';   // window
  const ICON_CLOCK = '⏰'; // clock
  const ICON_CALENDAR = '📆'; // calendar
  const ICON_COST = '💸';  // dollar
  const RESET = '\x1b[0m';
  const DIM = '\x1b[2m';
  const SEP = `${DIM} │ ${RESET}`;

  const colorByRemain = (v) =>
    v <= 20 ? '\x1b[31m' : v <= 49 ? '\x1b[33m' : '\x1b[32m';

  const miniBar = (percent, width = 10) => {
    const filled = Math.floor((percent * width) / 100);
    return '━'.repeat(filled) + '┄'.repeat(width - filled);
  };

  const parts = [];

  // dir + git branch (plain, joined with thin separator like the rest)
  const cwd = (input.workspace && input.workspace.current_dir) || input.cwd || process.cwd();
  let head = require('path').basename(cwd);
  try {
    const branch = require('child_process')
      .execSync('git rev-parse --abbrev-ref HEAD', { cwd, timeout: 1500, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
    if (branch) head += `${DIM} | ${RESET}${branch}`;
  } catch {}
  parts.push(head);

  // Model (color by name: sonnet/opus/fable/haiku; bold magenta fallback)
  const colorByModel = (name) => {
    const n = name.toLowerCase();
    if (n.includes('sonnet')) return '\x1b[0;38;5;6;49m'; // (cyan/teal)
    if (n.includes('opus')) return '\x1b[0;38;5;173;49m'; // (orange/tan)
    if (n.includes('fable')) return '\x1b[0;38;5;198;49m'; // (magenta/pink)
    if (n.includes('haiku')) return '\x1b[0;38;5;7;49m'; // (light gray)
    return '\x1b[1;35m';
  };
  const model = input.model && input.model.display_name;
  if (model) {
    const effort = input.effort && input.effort.level;
    const suffix = effort ? ` ${DIM}(${effort})${RESET}` : '';
    parts.push(`${colorByModel(model)}${model}${RESET}${suffix}`);
  }

  // Context remaining (bar + %)
  const ctx = input.context_window || {};
  let remain = ctx.remaining_percentage;
  if (typeof remain !== 'number' && typeof ctx.used_percentage === 'number') {
    remain = 100 - ctx.used_percentage;
  }
  if (typeof remain === 'number') {
    const val = Math.round(remain);
    parts.push(`${colorByRemain(val)}${ICON_CTX} ctx:${miniBar(val)} ${val}%${RESET}`);
  }

  // 5h / 7d rate limits (shown as % remaining)
  const rl = input.rate_limits || {};
  for (const [key, label, icon] of [['five_hour', '5h', ICON_CLOCK], ['seven_day', '7d', ICON_CALENDAR]]) {
    const used = rl[key] && rl[key].used_percentage;
    if (typeof used === 'number') {
      const val = 100 - Math.round(used);
      parts.push(`${colorByRemain(val)}${icon} ${label}:${val}%${RESET}`);
    }
  }

  // Session cost (dim)
  const cost = input.cost && input.cost.total_cost_usd;
  if (typeof cost === 'number' && cost > 0) {
    parts.push(`${DIM}${ICON_COST} $${cost.toFixed(2)}${RESET}`);
  }

  process.stdout.write(parts.join(SEP));
});
