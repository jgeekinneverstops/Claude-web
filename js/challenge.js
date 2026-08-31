/* ============================================================
   $500 → $10,000 challenge tracker
   A journal that grades decisions. It has no market access.
   ============================================================ */

const STORE_KEY = 'challenge-v1';

const SOURCE_LABELS = {
  tweet: 'Tweet / X post',
  callout: 'Callout',
  announcement: 'Announcement',
  listing: 'Exchange listing',
  onchain: 'On-chain / flow',
  technical: 'Own setup',
  other: 'Other',
};

const DEFAULTS = { start: 500, goal: 10000, riskPct: 2 };

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULTS, ...(parsed.settings || {}) },
        trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      };
    }
  } catch (err) {
    console.warn('Could not read saved data:', err);
  }
  return { settings: { ...DEFAULTS }, trades: [] };
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save data:', err);
  }
}

/* ---------- Trade math ----------
   riskPerUnit is always positive: the distance from entry to stop.
   R is the result expressed in units of that risk, so a trade that
   goes exactly to its stop is -1R regardless of asset or size.      */

function riskPerUnit(t) {
  const d = t.side === 'long' ? t.entry - t.stop : t.stop - t.entry;
  return d > 0 ? d : 0;
}

function riskAmount(t) {
  return riskPerUnit(t) * t.size;
}

function pnl(t) {
  if (t.exit == null) return null;
  const per = t.side === 'long' ? t.exit - t.entry : t.entry - t.exit;
  return per * t.size;
}

function rMultiple(t) {
  const risk = riskAmount(t);
  const p = pnl(t);
  if (p == null || risk <= 0) return null;
  return p / risk;
}

const isClosed = (t) => t.exit != null;

/* ---------- Derived state ----------
   Walks trades in log order so each trade's risk can be measured
   against the equity that actually existed when it was taken.       */

function derive() {
  const { start, goal } = state.settings;
  const closed = state.trades.filter(isClosed);

  let equity = start;
  let peak = start;
  let maxDD = 0;
  const curve = [start];
  const riskFractions = [];

  for (const t of closed) {
    const risk = riskAmount(t);
    if (equity > 0 && risk > 0) riskFractions.push(risk / equity);
    equity += pnl(t);
    curve.push(equity);
    if (equity > peak) peak = equity;
    if (peak > 0) maxDD = Math.max(maxDD, (peak - equity) / peak);
  }

  const rs = closed.map(rMultiple).filter((r) => r != null);
  const wins = rs.filter((r) => r > 0);
  const losses = rs.filter((r) => r <= 0);
  const totalR = rs.reduce((a, b) => a + b, 0);
  const expectancy = rs.length ? totalR / rs.length : null;
  const avgRiskFrac = riskFractions.length
    ? riskFractions.reduce((a, b) => a + b, 0) / riskFractions.length
    : state.settings.riskPct / 100;

  const openRisk = state.trades
    .filter((t) => !isClosed(t))
    .reduce((a, t) => a + riskAmount(t), 0);

  return {
    start, goal, equity, peak, maxDD, curve,
    closed, rs, wins, losses, totalR, expectancy, avgRiskFrac, openRisk,
    winRate: rs.length ? wins.length / rs.length : null,
  };
}

/* ---------- Formatting ---------- */

const money = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const moneyShort = (n) =>
  '$' + Math.round(n).toLocaleString('en-US');

const pct = (n, digits = 1) => (n * 100).toFixed(digits) + '%';

const signedR = (r) => (r >= 0 ? '+' : '') + r.toFixed(2) + 'R';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------- Scoreboard ---------- */

function renderScoreboard(d) {
  document.getElementById('equity').textContent = money(d.equity);
  document.getElementById('multiple').textContent = (d.equity / d.start).toFixed(2) + '×';

  // Progress is measured on a log scale: going 500 → 1,000 is the same
  // amount of work as 5,000 → 10,000, and a linear bar hides that.
  const span = Math.log(d.goal / d.start);
  const done = Math.log(Math.max(d.equity, 1) / d.start);
  const frac = Math.min(Math.max(done / span, 0), 1);

  document.getElementById('progressFill').style.width = pct(frac, 0);
  document.getElementById('progressNote').textContent =
    `${pct(frac, 0)} of the way to ${moneyShort(d.goal)} — ` +
    `${(d.goal / d.equity).toFixed(1)}× still to go`;

  const set = (id, text, cls) => {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'stat-value' + (cls ? ' ' + cls : '');
  };

  set('statTrades', String(d.closed.length));
  set('statWin', d.winRate == null ? '—' : pct(d.winRate, 0));
  set('statR', signedR(d.totalR), d.totalR >= 0 ? 'pos' : 'neg');
  set('statDD', pct(d.maxDD, d.maxDD > 0 && d.maxDD < 0.01 ? 2 : 1), d.maxDD > 0.3 ? 'neg' : '');
  set('statOpenRisk', moneyShort(d.openRisk));

  if (d.expectancy == null) {
    set('statExp', '—');
  } else {
    set('statExp', signedR(d.expectancy), d.expectancy > 0 ? 'pos' : 'neg');
  }
}

/* ---------- Equity curve ---------- */

function renderCurve(d) {
  const svg = document.getElementById('curve');
  const empty = document.getElementById('curveEmpty');

  if (d.curve.length < 2) {
    svg.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const W = 800, H = 240, pad = 12;
  const lo = Math.min(...d.curve, d.start);
  const hi = Math.max(...d.curve, d.start);
  const range = hi - lo || 1;

  const x = (i) => pad + (i / (d.curve.length - 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - lo) / range) * (H - pad * 2);

  const pts = d.curve.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `${x(0).toFixed(1)},${(H - pad).toFixed(1)} ${pts.join(' ')} ${x(d.curve.length - 1).toFixed(1)},${(H - pad).toFixed(1)}`;

  svg.innerHTML =
    `<polygon class="curve-area" points="${area}"></polygon>` +
    `<line class="curve-base" x1="${pad}" y1="${y(d.start).toFixed(1)}" x2="${W - pad}" y2="${y(d.start).toFixed(1)}"></line>` +
    `<polyline class="curve-line" points="${pts.join(' ')}"></polyline>`;
}

/* ---------- The honest math ----------
   Compounding at a fixed fraction: each trade multiplies equity by
   roughly (1 + riskFraction * expectancy). Solving for the number of
   trades to reach the goal is the most useful number on the page,
   because it is usually far larger than people expect.              */

function renderMath(d) {
  const tradesEl = document.getElementById('mathTrades');
  const hintEl = document.getElementById('mathTradesHint');
  const ruinEl = document.getElementById('mathRuin');
  const riskEl = document.getElementById('mathRisk');

  riskEl.textContent = pct(d.avgRiskFrac, 1);

  // How many losses in a row before half the account is gone.
  const halving = Math.log(0.5) / Math.log(1 - Math.min(d.avgRiskFrac, 0.99));
  ruinEl.textContent = plural(Math.max(1, Math.round(halving)), 'loss', 'losses');
  ruinEl.className = 'math-value' + (halving < 10 ? ' bad' : '');

  if (d.expectancy == null || d.closed.length < 5) {
    tradesEl.textContent = '—';
    tradesEl.className = 'math-value';
    hintEl.textContent = `Needs at least 5 closed trades (you have ${d.closed.length}).`;
    return;
  }

  const growth = 1 + d.avgRiskFrac * d.expectancy;

  if (growth <= 1) {
    tradesEl.textContent = 'Never';
    tradesEl.className = 'math-value bad';
    hintEl.textContent =
      'Your expectancy is negative, so more trades means less money, not more. ' +
      'Stop sizing up and fix the edge first.';
    return;
  }

  if (d.equity >= d.goal) {
    tradesEl.textContent = 'Done';
    tradesEl.className = 'math-value good';
    hintEl.textContent = 'Goal reached. Withdraw the original stake before anything else.';
    return;
  }

  const n = Math.ceil(Math.log(d.goal / d.equity) / Math.log(growth));
  tradesEl.textContent = n.toLocaleString('en-US');
  tradesEl.className = 'math-value' + (n > 400 ? ' bad' : '');
  hintEl.textContent =
    `At ${signedR(d.expectancy)} expectancy and ${pct(d.avgRiskFrac, 1)} risk per trade. ` +
    (n > 400
      ? 'That is a multi-year grind — the fix is a better edge, not bigger size.'
      : 'Sample is still small; expect this number to move a lot.');
}

/* ---------- Milestones ---------- */

function renderMilestones(d) {
  const list = document.getElementById('milestones');
  const steps = 10;
  const ratio = Math.pow(d.goal / d.start, 1 / steps);

  const rows = [];
  for (let i = 1; i <= steps; i++) {
    const level = d.start * Math.pow(ratio, i);
    const prev = d.start * Math.pow(ratio, i - 1);
    const hit = d.equity >= level;
    rows.push(
      `<li class="milestone${hit ? ' hit' : ''}">` +
        `<span class="milestone-amount">${moneyShort(level)}</span>` +
        `<span class="milestone-step">from ${moneyShort(prev)} — needs +${((ratio - 1) * 100).toFixed(0)}%</span>` +
        `<span class="milestone-mark">${hit ? '✓' : ''}</span>` +
      `</li>`
    );
  }
  list.innerHTML = rows.join('');
}

/* ---------- Source edge ---------- */

function renderSources(d) {
  const tbody = document.querySelector('#sourceTable tbody');
  const empty = document.getElementById('sourceEmpty');

  const groups = new Map();
  for (const t of d.closed) {
    const r = rMultiple(t);
    if (r == null) continue;
    if (!groups.has(t.source)) groups.set(t.source, []);
    groups.get(t.source).push(r);
  }

  if (!groups.size) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const rows = [...groups.entries()]
    .map(([source, rs]) => {
      const total = rs.reduce((a, b) => a + b, 0);
      const exp = total / rs.length;
      const wr = rs.filter((r) => r > 0).length / rs.length;
      return { source, n: rs.length, total, exp, wr };
    })
    .sort((a, b) => b.exp - a.exp);

  tbody.innerHTML = rows
    .map((g) => {
      // Below ~20 trades the expectancy is mostly luck, and saying so
      // matters more than the number itself.
      const thin = g.n < 20;
      const verdict = thin
        ? `<span class="verdict thin">Too few (${20 - g.n} more)</span>`
        : g.exp > 0.1
        ? '<span class="verdict pos">Keep trading these</span>'
        : g.exp < -0.1
        ? '<span class="verdict neg">This is costing you</span>'
        : '<span class="verdict thin">Break-even</span>';

      return (
        `<tr>` +
          `<td><span class="tag">${escapeHtml(SOURCE_LABELS[g.source] || g.source)}</span></td>` +
          `<td>${g.n}</td>` +
          `<td>${pct(g.wr, 0)}</td>` +
          `<td class="${g.total >= 0 ? 'pos' : 'neg'}">${signedR(g.total)}</td>` +
          `<td class="${g.exp >= 0 ? 'pos' : 'neg'}">${signedR(g.exp)}</td>` +
          `<td>${verdict}</td>` +
        `</tr>`
      );
    })
    .join('');
}

/* ---------- Trade log ---------- */

function renderTrades() {
  const tbody = document.querySelector('#tradeTable tbody');
  const empty = document.getElementById('tradeEmpty');

  if (!state.trades.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const rows = [...state.trades].reverse().map((t) => {
    const p = pnl(t);
    const r = rMultiple(t);
    const open = !isClosed(t);

    const main =
      `<tr class="${open ? 'open-row' : ''}">` +
        `<td>${escapeHtml(t.date)}</td>` +
        `<td><strong>${escapeHtml(t.asset)}</strong></td>` +
        `<td>${t.side === 'long' ? 'Long' : 'Short'}</td>` +
        `<td><span class="tag">${escapeHtml(SOURCE_LABELS[t.source] || t.source)}</span></td>` +
        `<td>${t.entry}</td>` +
        `<td>${t.stop}</td>` +
        `<td>${open ? '<em>open</em>' : t.exit}</td>` +
        `<td class="${p == null ? '' : p >= 0 ? 'pos' : 'neg'}">${p == null ? '—' : money(p)}</td>` +
        `<td class="${r == null ? '' : r >= 0 ? 'pos' : 'neg'}">${r == null ? '—' : signedR(r)}</td>` +
        `<td>` +
          (open ? `<button class="row-btn" data-close="${t.id}">Close</button>` : '') +
          `<button class="row-btn" data-delete="${t.id}">Delete</button>` +
        `</td>` +
      `</tr>`;

    const thesis = t.thesis
      ? `<tr class="thesis-row"><td colspan="10">` +
        (t.ref ? `<strong>${escapeHtml(t.ref)}</strong> — ` : '') +
        `${escapeHtml(t.thesis)}</td></tr>`
      : '';

    return main + thesis;
  });

  tbody.innerHTML = rows.join('');
}

/* ---------- Render all ---------- */

function render() {
  const d = derive();
  renderScoreboard(d);
  renderCurve(d);
  renderMath(d);
  renderMilestones(d);
  renderSources(d);
  renderTrades();
  updateSizer();
}

/* ---------- Position sizing ----------
   The single most protective feature here: it refuses to let a
   position quietly risk a third of the account.                    */

const num = (id) => {
  const v = parseFloat(document.getElementById(id).value);
  return Number.isFinite(v) ? v : null;
};

function updateSizer() {
  const box = document.getElementById('sizer');
  const entry = num('f-entry');
  const stop = num('f-stop');
  const size = num('f-size');
  const side = document.getElementById('f-side').value;
  const d = derive();

  box.className = 'sizer';

  if (entry == null || stop == null || entry <= 0 || stop <= 0) {
    box.innerHTML = '<p class="sizer-line">Set an entry and a stop to see your risk.</p>';
    return;
  }

  const per = side === 'long' ? entry - stop : stop - entry;

  if (per <= 0) {
    box.className = 'sizer over';
    box.innerHTML =
      `<p class="sizer-line"><strong>That stop is on the wrong side of the entry.</strong> ` +
      `A ${side} stop must sit ${side === 'long' ? 'below' : 'above'} the entry price, ` +
      `or there is nothing limiting the loss.</p>`;
    return;
  }

  const cap = d.equity * (state.settings.riskPct / 100);
  const suggested = per > 0 ? cap / per : 0;
  const lines = [
    `<p class="sizer-line">Risk per unit: <strong>${per.toPrecision(6)}</strong> ` +
    `(${pct(per / entry, 1)} move to stop)</p>`,
    `<p class="sizer-line">Max size at ${state.settings.riskPct}% of ${money(d.equity)}: ` +
    `<strong>${suggested.toPrecision(6)} units</strong> (risking ${money(cap)})</p>`,
  ];

  if (size != null && size > 0) {
    const risk = per * size;
    const frac = risk / d.equity;
    lines.push(
      `<p class="sizer-line">This size risks <strong>${money(risk)}</strong> — ` +
      `${pct(frac, 1)} of the account.</p>`
    );
    if (frac > state.settings.riskPct / 100) {
      box.className = 'sizer over';
      const halving = Math.log(0.5) / Math.log(1 - Math.min(frac, 0.99));
      lines.push(
        `<p class="sizer-line"><strong>Over your ${state.settings.riskPct}% limit.</strong> ` +
        `At this size, ${plural(Math.max(1, Math.round(halving)), 'loss', 'losses')} in a row ` +
        `${Math.round(halving) === 1 ? 'halves' : 'halve'} the account.</p>`
      );
    } else {
      box.className = 'sizer ok';
      lines.push('<p class="sizer-line">Within your risk limit.</p>');
    }
  }

  box.innerHTML = lines.join('');
}

/* ---------- Events ---------- */

document.getElementById('tradeForm').addEventListener('input', updateSizer);
document.getElementById('f-side').addEventListener('change', updateSizer);

document.getElementById('suggestSize').addEventListener('click', () => {
  const entry = num('f-entry');
  const stop = num('f-stop');
  const side = document.getElementById('f-side').value;
  if (entry == null || stop == null) return;
  const per = side === 'long' ? entry - stop : stop - entry;
  if (per <= 0) return;
  const d = derive();
  const size = (d.equity * (state.settings.riskPct / 100)) / per;
  document.getElementById('f-size').value = Number(size.toPrecision(6));
  updateSizer();
});

document.getElementById('tradeForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const side = document.getElementById('f-side').value;
  const entry = num('f-entry');
  const stop = num('f-stop');
  const per = side === 'long' ? entry - stop : stop - entry;

  if (!(per > 0)) {
    alert(
      `A ${side} stop has to sit ${side === 'long' ? 'below' : 'above'} the entry.\n\n` +
      'Without that, the trade has no defined risk and none of the numbers on this page mean anything.'
    );
    return;
  }

  const trade = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    date: document.getElementById('f-date').value,
    asset: document.getElementById('f-asset').value.trim().toUpperCase(),
    side,
    source: document.getElementById('f-source').value,
    ref: document.getElementById('f-ref').value.trim(),
    thesis: document.getElementById('f-thesis').value.trim(),
    entry,
    stop,
    target: num('f-target'),
    size: num('f-size'),
    exit: null,
  };

  state.trades.push(trade);
  save();
  render();

  e.target.reset();
  document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);
  updateSizer();
});

document.querySelector('#tradeTable tbody').addEventListener('click', (e) => {
  const closeId = e.target.dataset.close;
  const deleteId = e.target.dataset.delete;

  if (closeId) {
    const t = state.trades.find((x) => x.id === closeId);
    if (!t) return;
    const raw = prompt(`Exit price for ${t.asset}?`, t.target ?? '');
    if (raw == null) return;
    const exit = parseFloat(raw);
    if (!Number.isFinite(exit) || exit <= 0) {
      alert('That is not a valid exit price.');
      return;
    }
    t.exit = exit;
    save();
    render();
  }

  if (deleteId) {
    const t = state.trades.find((x) => x.id === deleteId);
    if (!t) return;
    if (!confirm(`Delete the ${t.asset} trade from ${t.date}? This cannot be undone.`)) return;
    state.trades = state.trades.filter((x) => x.id !== deleteId);
    save();
    render();
  }
});

/* ---------- Settings ---------- */

function bindSetting(id, key) {
  const el = document.getElementById(id);
  el.value = state.settings[key];
  el.addEventListener('change', () => {
    const v = parseFloat(el.value);
    if (Number.isFinite(v) && v > 0) {
      state.settings[key] = v;
      save();
      document.getElementById('riskPctLabel').textContent = state.settings.riskPct;
      render();
    } else {
      el.value = state.settings[key];
    }
  });
}

bindSetting('s-start', 'start');
bindSetting('s-goal', 'goal');
bindSetting('s-risk', 'riskPct');
document.getElementById('riskPctLabel').textContent = state.settings.riskPct;

document.getElementById('resetAll').addEventListener('click', () => {
  if (!confirm('Erase every logged trade and reset settings? Export first if you want a copy.')) return;
  state = { settings: { ...DEFAULTS }, trades: [] };
  save();
  document.getElementById('s-start').value = state.settings.start;
  document.getElementById('s-goal').value = state.settings.goal;
  document.getElementById('s-risk').value = state.settings.riskPct;
  render();
});

/* ---------- Export / import ---------- */

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('exportJson').addEventListener('click', () => {
  download('challenge-log.json', JSON.stringify(state, null, 2), 'application/json');
});

document.getElementById('exportCsv').addEventListener('click', () => {
  const head = ['date', 'asset', 'side', 'source', 'ref', 'thesis', 'entry', 'stop', 'target', 'size', 'exit', 'pnl', 'r'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = state.trades.map((t) => {
    const r = rMultiple(t);
    return [
      t.date, t.asset, t.side, SOURCE_LABELS[t.source] || t.source, t.ref, t.thesis,
      t.entry, t.stop, t.target, t.size, t.exit,
      pnl(t) ?? '', r == null ? '' : r.toFixed(3),
    ].map(cell).join(',');
  });
  download('challenge-log.csv', [head.join(','), ...rows].join('\n'), 'text/csv');
});

document.getElementById('importJson').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.trades)) throw new Error('No trades array in that file.');
      state = {
        settings: { ...DEFAULTS, ...(parsed.settings || {}) },
        trades: parsed.trades,
      };
      save();
      document.getElementById('s-start').value = state.settings.start;
      document.getElementById('s-goal').value = state.settings.goal;
      document.getElementById('s-risk').value = state.settings.riskPct;
      render();
    } catch (err) {
      alert('Could not read that file: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ---------- Theme (matches the main site) ---------- */

const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  root.setAttribute('data-theme', 'dark');
}

document.querySelector('.theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ---------- Boot ---------- */

document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);
render();
