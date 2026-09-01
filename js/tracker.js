/* ===========================================================
   Capital Ledger
   Everything is local: state lives in localStorage, nothing
   leaves the browser.
   =========================================================== */
(function () {
  'use strict';

  var STORE = 'capital-ledger-v1';

  /* Long-run assumptions, stated once so they are easy to argue with. */
  var MARKET_RATE    = 0.10;  /* broad index, nominal, long-run average */
  var AGGRESSIVE_RATE = 0.25; /* sustained rate almost nobody holds for decades */
  var WITHDRAW_RATE  = 0.08;  /* return you'd have to earn to live off a balance */
  var WEEKS_PER_MONTH = 52 / 12;

  /* ---------- Seed data ---------- */

  var SEED = {
    capital: 1200,
    target: 2500,
    current: 0,
    monthly: 200,
    years: 30,
    holdings: [
      { name: 'Business cash buffer',        type: 'Cash / HYSA',     cost: 300, value: 300 },
      { name: 'VTI — total market index',    type: 'Index fund',      cost: 400, value: 400 },
      { name: 'Pressure washer + surface cleaner', type: 'Business asset', cost: 500, value: 500 }
    ],
    ventures: [
      {
        name: 'Pressure washing', cat: 'Service', status: 'building',
        costLow: 650, costHigh: 1100, weeks: 2, profitLow: 900, profitHigh: 3200,
        hours: 15, risk: 'low',
        note: 'Used 3,000 PSI machine, surface cleaner, hose reel. Driveways and siding, repeating every 12–18 months.'
      },
      {
        name: 'Lawn care & yard cleanup', cat: 'Service', status: 'research',
        costLow: 700, costHigh: 1200, weeks: 1, profitLow: 800, profitHigh: 2600,
        hours: 18, risk: 'low',
        note: 'Used commercial mower, trimmer, blower. Route density — many lawns on one street — beats charging more.'
      },
      {
        name: 'Mobile car detailing', cat: 'Service', status: 'research',
        costLow: 500, costHigh: 1000, weeks: 2, profitLow: 700, profitHigh: 2800,
        hours: 16, risk: 'low',
        note: 'Extractor, polisher, chemicals, water tank. Dealers and small fleets pay more reliably than one-off retail.'
      },
      {
        name: 'Junk removal & hauling', cat: 'Service', status: 'idea',
        costLow: 300, costHigh: 800, weeks: 1, profitLow: 900, profitHigh: 3500,
        hours: 20, risk: 'medium',
        note: 'Needs truck or trailer access. Best revenue per hour of the trades here, and the hardest on your body.'
      },
      {
        name: 'Handyman & furniture assembly', cat: 'Service', status: 'idea',
        costLow: 400, costHigh: 900, weeks: 2, profitLow: 600, profitHigh: 2400,
        hours: 14, risk: 'low',
        note: 'Drill, driver set, stud finder, TV mounts. Steady work, low ceiling until you specialise.'
      },
      {
        name: 'Vending machine (one unit)', cat: 'Semi-passive', status: 'idea',
        costLow: 600, costHigh: 1200, weeks: 5, profitLow: 80, profitHigh: 300,
        hours: 3, risk: 'medium',
        note: 'The closest thing here to an investment: buy the asset, restock it. One machine is pocket change — the model only works at ten or more.'
      },
      {
        name: 'Resale flipping', cat: 'Retail', status: 'idea',
        costLow: 300, costHigh: 700, weeks: 2, profitLow: 400, profitHigh: 1500,
        hours: 12, risk: 'medium',
        note: 'Thrift and clearance sourcing into eBay or marketplace. Capital sits in unsold stock, so cash flow lags profit.'
      },
      {
        name: 'Freelance service work', cat: 'Digital', status: 'idea',
        costLow: 0, costHigh: 150, weeks: 4, profitLow: 300, profitHigh: 2200,
        hours: 12, risk: 'medium',
        note: 'Writing, design, editing, bookkeeping. Nearly free to start, so the $1,200 stays invested — slowest to the first dollar, highest ceiling per hour.'
      },
      {
        name: 'Index fund, the whole $1,200', cat: 'Investment', status: 'earning',
        costLow: 1200, costHigh: 1200, weeks: 0, profitLow: 8, profitHigh: 12,
        hours: 0, risk: 'low',
        note: 'The honest benchmark. Your entire balance earns about ten dollars a month. It is here so every other row has something to beat.'
      }
    ],
    ladder: [
      { share: 0.10, title: 'First paying customer',
        detail: 'Pick one venture, buy the minimum kit, finish one job and get paid for it. Nothing else counts until this happens.', done: false },
      { share: 0.20, title: 'A week you can repeat',
        detail: 'Four to six jobs a week at a price you wrote down. You now have a rate card instead of a guess.', done: false },
      { share: 0.40, title: 'Booked past your own hours',
        detail: 'Demand exceeds the time you have. Raise prices here, before hiring — most people do it in the other order and stay broke.', done: false },
      { share: 0.64, title: 'First helper',
        detail: 'One hire roughly doubles capacity and cuts margin per job. Volume has to arrive before the payroll does.', done: false },
      { share: 1.00, title: 'Second crew or second machine',
        detail: 'The rung that reaches the target — and where the investing half of this ledger finally matters, because profit is what buys the asset.', done: false }
    ]
  };

  /* ---------- State ---------- */

  var state;

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) {
        var saved = JSON.parse(raw);
        return {
          capital:  num(saved.capital,  SEED.capital),
          target:   num(saved.target,   SEED.target),
          current:  num(saved.current,  SEED.current),
          monthly:  num(saved.monthly,  SEED.monthly),
          years:    num(saved.years,    SEED.years),
          holdings: Array.isArray(saved.holdings) ? saved.holdings : clone(SEED.holdings),
          ventures: Array.isArray(saved.ventures) ? saved.ventures : clone(SEED.ventures),
          ladder:   Array.isArray(saved.ladder)   ? saved.ladder   : clone(SEED.ladder)
        };
      }
    } catch (e) { /* corrupt or unavailable storage — fall through to seed */ }
    return clone(SEED);
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) ? n : fallback;
  }

  /* ---------- Formatting ---------- */

  var usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function money(n) {
    if (!isFinite(n)) return '—';
    return Math.abs(n) < 100 ? usd2.format(n) : usd0.format(n);
  }

  function compact(n) {
    if (!isFinite(n)) return '—';
    var abs = Math.abs(n);
    if (abs >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
    if (abs >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3)  return '$' + Math.round(n / 1e3) + 'k';
    return '$' + Math.round(n);
  }

  /* Numbers past the point of comprehension get scientific notation rather
     than a wall of zeros — the shape of the number is the message. */
  function huge(n) {
    if (!isFinite(n)) return 'more than a number can hold';
    if (n < 1e15) return compact(n);
    var exp = Math.floor(Math.log10(n));
    var mant = (n / Math.pow(10, exp)).toFixed(1);
    return '$' + mant + ' × 10' + superscript(exp);
  }

  function superscript(n) {
    var map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n).split('').map(function (c) { return map[c] || c; }).join('');
  }

  function pct(n, digits) {
    if (!isFinite(n)) return '—';
    return n.toFixed(digits === undefined ? 1 : digits) + '%';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function $(id) { return document.getElementById(id); }

  /* ===========================================================
     The reality check
     =========================================================== */

  /* Balance you'd need for investment returns alone to cover the target. */
  function balanceNeeded() {
    return (state.target * 52) / WITHDRAW_RATE;
  }

  /* Months for a balance to grow from `start` to `goal` at `rate`,
     adding `monthly` each month. Returns Infinity when it never gets there. */
  function monthsToReach(start, goal, rate, monthly) {
    var r = rate / 12;
    var bal = start;
    for (var m = 1; m <= 12 * 200; m++) {
      bal = bal * (1 + r) + monthly;
      if (bal >= goal) return m;
    }
    return Infinity;
  }

  function renderMath() {
    var rows = $('math-rows');
    rows.innerHTML = '';

    var weeklyRate = state.capital > 0 ? state.target / state.capital : Infinity;
    var afterOneYear = state.capital > 0 ? state.capital * Math.pow(1 + weeklyRate, 52) : Infinity;
    var needed = balanceNeeded();
    var realWeekly = state.capital * WITHDRAW_RATE / 52;
    var months = monthsToReach(state.capital, needed, MARKET_RATE, state.monthly);

    var timeText;
    if (!isFinite(months)) {
      timeText = 'never at this rate';
    } else {
      var yrs = months / 12;
      timeText = yrs < 10 ? yrs.toFixed(1) + ' years' : Math.round(yrs) + ' years';
    }

    var data = [
      {
        term: 'Weekly return you would need on the balance',
        value: pct(weeklyRate * 100, 0),
        sub: 'the best investors alive average about 0.4%',
        tone: 'is-critical'
      },
      {
        term: 'What ' + money(state.capital) + ' would be worth after one year at that rate',
        value: huge(afterOneYear),
        sub: 'total world GDP is about $1 × 10¹⁴',
        tone: 'is-critical'
      },
      {
        term: 'Balance actually required, at a sustainable ' + Math.round(WITHDRAW_RATE * 100) + '% a year',
        value: compact(needed),
        sub: 'this is the real number',
        tone: ''
      },
      {
        term: 'What your capital earns you per week today',
        value: money(realWeekly),
        sub: 'at ' + Math.round(WITHDRAW_RATE * 100) + '% a year on ' + money(state.capital),
        tone: ''
      },
      {
        term: 'Time to reach that balance at ' + Math.round(MARKET_RATE * 100) + '% a year, adding ' + money(state.monthly) + '/mo',
        value: timeText,
        sub: 'investing alone — before any business income',
        tone: 'is-good'
      }
    ];

    data.forEach(function (row) {
      var wrap = el('div', 'math-row ' + row.tone);
      wrap.appendChild(el('dt', null, row.term));
      var dd = el('dd', null, row.value);
      dd.appendChild(el('small', null, row.sub));
      wrap.appendChild(dd);
      rows.appendChild(wrap);
    });
  }

  /* ===========================================================
     Goal bar
     =========================================================== */

  function ventureWeekly(v) {
    var mid = (num(v.profitLow, 0) + num(v.profitHigh, 0)) / 2;
    return mid / WEEKS_PER_MONTH;
  }

  function renderGoal() {
    var capitalWeekly = totals().value * WITHDRAW_RATE / 52;
    var earned = state.current + capitalWeekly;
    var share = state.target > 0 ? Math.min(earned / state.target, 1) : 0;

    $('goal-figure').innerHTML = '';
    $('goal-figure').appendChild(document.createTextNode(money(earned) + ' '));
    var span = el('span', null, 'of ' + money(state.target) + ' a week');
    $('goal-figure').appendChild(span);

    $('goal-pct').textContent = pct(share * 100, share < 0.1 ? 1 : 0) + ' there';
    $('goal-fill').style.width = (share * 100) + '%';
    $('goal-track').setAttribute('aria-valuenow', Math.round(share * 100));

    var gap = Math.max(state.target - earned, 0);
    var running = state.ventures.filter(function (v) { return v.status === 'earning'; });
    var foot;
    if (gap <= 0) {
      foot = 'Target met. The next question is whether it holds for three months without you working every one of those hours.';
    } else {
      foot = money(gap) + ' a week still to find. Your capital contributes ' + money(capitalWeekly) +
             ' of that — the rest has to be earned.';
      if (running.length) {
        foot += ' ' + running.length + ' venture' + (running.length > 1 ? 's are' : ' is') + ' marked as earning.';
      }
    }
    $('goal-foot').textContent = foot;
  }

  /* ===========================================================
     Growth chart — log scale, because the series spans four
     orders of magnitude and a linear axis would hide the whole
     early period.
     =========================================================== */

  var CHART = { w: 900, h: 400, top: 24, right: 118, bottom: 44, left: 62 };

  function project(rate, years, monthly) {
    var pts = [];
    var bal = state.capital;
    var r = rate / 12;
    pts.push(bal);
    for (var m = 1; m <= years * 12; m++) {
      bal = bal * (1 + r) + monthly;
      pts.push(bal);
    }
    return pts;
  }

  function svgEl(name, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) node.setAttribute(k, attrs[k]);
    }
    return node;
  }

  var chartCache = null;

  function renderChart() {
    var svg = $('chart');
    svg.innerHTML = '';

    var years = Math.max(5, Math.min(50, Math.round(state.years)));
    var market = project(MARKET_RATE, years, state.monthly);
    var aggressive = project(AGGRESSIVE_RATE, years, state.monthly);
    var needed = balanceNeeded();

    var plotW = CHART.w - CHART.left - CHART.right;
    var plotH = CHART.h - CHART.top - CHART.bottom;

    var lo = Math.max(100, state.capital * 0.7);
    var hi = Math.max(needed * 1.8, aggressive[aggressive.length - 1] * 1.2);
    var logLo = Math.log10(lo);
    var logHi = Math.log10(hi);

    function x(monthIndex) { return CHART.left + (monthIndex / (years * 12)) * plotW; }
    function y(value) {
      var v = Math.max(value, lo);
      return CHART.top + plotH - ((Math.log10(v) - logLo) / (logHi - logLo)) * plotH;
    }

    /* --- horizontal grid at each power of ten --- */
    for (var e = Math.ceil(logLo); e <= Math.floor(logHi); e++) {
      var gv = Math.pow(10, e);
      var gy = y(gv);
      svg.appendChild(svgEl('line', {
        x1: CHART.left, x2: CHART.left + plotW, y1: gy, y2: gy,
        stroke: 'var(--grid)', 'stroke-width': 1
      }));
      var lab = svgEl('text', {
        x: CHART.left - 10, y: gy + 4, 'text-anchor': 'end',
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--font-data)'
      });
      lab.textContent = compact(gv);
      svg.appendChild(lab);
    }

    /* --- x axis --- */
    svg.appendChild(svgEl('line', {
      x1: CHART.left, x2: CHART.left + plotW, y1: CHART.top + plotH, y2: CHART.top + plotH,
      stroke: 'var(--rule)', 'stroke-width': 1
    }));
    var step = years <= 10 ? 2 : years <= 30 ? 5 : 10;
    for (var t = 0; t <= years; t += step) {
      var tx = x(t * 12);
      var tick = svgEl('text', {
        x: tx, y: CHART.top + plotH + 20, 'text-anchor': 'middle',
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--font-data)'
      });
      tick.textContent = t === 0 ? 'now' : 'yr ' + t;
      svg.appendChild(tick);
    }

    /* --- the balance you actually need --- */
    if (needed >= lo && needed <= hi) {
      var ny = y(needed);
      svg.appendChild(svgEl('line', {
        x1: CHART.left, x2: CHART.left + plotW, y1: ny, y2: ny,
        stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '6 5'
      }));
      var nLab = svgEl('text', {
        x: CHART.left + plotW + 8, y: ny + 4,
        fill: 'var(--muted)', 'font-size': 11, 'font-family': 'var(--font-data)'
      });
      nLab.textContent = compact(needed) + ' needed';
      svg.appendChild(nLab);
    }

    /* --- series --- */
    function pathFor(series) {
      return series.map(function (v, i) {
        return (i ? 'L' : 'M') + x(i).toFixed(2) + ' ' + y(v).toFixed(2);
      }).join(' ');
    }

    [
      { data: market,     color: 'var(--s1)', label: '10%/yr' },
      { data: aggressive, color: 'var(--s2)', label: '25%/yr' }
    ].forEach(function (s) {
      svg.appendChild(svgEl('path', {
        d: pathFor(s.data), fill: 'none', stroke: s.color,
        'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      }));
      var last = s.data[s.data.length - 1];
      var ly = y(last);
      /* endpoint marker with a surface ring so crossing lines stay readable */
      svg.appendChild(svgEl('circle', {
        cx: x(s.data.length - 1), cy: ly, r: 4.5,
        fill: s.color, stroke: 'var(--surface)', 'stroke-width': 2
      }));
      var dl = svgEl('text', {
        x: CHART.left + plotW + 8, y: ly + 4,
        fill: s.color, 'font-size': 11, 'font-weight': 600, 'font-family': 'var(--font-data)'
      });
      dl.textContent = compact(last);
      svg.appendChild(dl);
    });

    /* --- hover layer --- */
    var crosshair = svgEl('line', {
      y1: CHART.top, y2: CHART.top + plotH, stroke: 'var(--muted)',
      'stroke-width': 1, opacity: 0
    });
    svg.appendChild(crosshair);

    var dots = [ 'var(--s1)', 'var(--s2)' ].map(function (c) {
      var d = svgEl('circle', { r: 5, fill: c, stroke: 'var(--surface)', 'stroke-width': 2, opacity: 0 });
      svg.appendChild(d);
      return d;
    });

    var hit = svgEl('rect', {
      x: CHART.left, y: CHART.top, width: plotW, height: plotH,
      fill: 'transparent', style: 'cursor:crosshair'
    });
    svg.appendChild(hit);

    chartCache = {
      svg: svg, years: years, market: market, aggressive: aggressive,
      x: x, y: y, plotW: plotW, crosshair: crosshair, dots: dots, hit: hit
    };
    bindChartHover();

    $('chart-note').textContent =
      'Vertical axis is logarithmic — each gridline is ten times the one below it, which is the only way ' +
      money(state.capital) + ' and ' + compact(needed) + ' fit on one picture. ' +
      'Both curves assume ' + money(state.monthly) + ' added every month and no withdrawals or tax. ' +
      'A sustained 25% a year is included as an upper bound, not a plan — almost no one holds it for a decade.';
  }

  function bindChartHover() {
    var c = chartCache;
    var tip = $('chart-tip');
    var shell = $('chart-shell');

    function hide() {
      c.crosshair.setAttribute('opacity', 0);
      c.dots.forEach(function (d) { d.setAttribute('opacity', 0); });
      tip.classList.remove('on');
    }

    function move(evt) {
      var rect = c.svg.getBoundingClientRect();
      var scale = CHART.w / rect.width;
      var px = (evt.clientX - rect.left) * scale;
      var frac = (px - CHART.left) / c.plotW;
      frac = Math.max(0, Math.min(1, frac));
      var idx = Math.round(frac * c.years * 12);

      var cx = c.x(idx);
      c.crosshair.setAttribute('x1', cx);
      c.crosshair.setAttribute('x2', cx);
      c.crosshair.setAttribute('opacity', 0.45);

      var vals = [ c.market[idx], c.aggressive[idx] ];
      c.dots.forEach(function (d, i) {
        d.setAttribute('cx', cx);
        d.setAttribute('cy', c.y(vals[i]));
        d.setAttribute('opacity', 1);
      });

      var yrs = idx / 12;
      tip.innerHTML = '';
      tip.appendChild(el('div', 'tooltip-year',
        yrs < 1 ? 'Month ' + idx : 'Year ' + (yrs % 1 === 0 ? yrs : yrs.toFixed(1))));
      [
        { label: '10%/yr', color: 'var(--s1)', v: vals[0] },
        { label: '25%/yr', color: 'var(--s2)', v: vals[1] }
      ].forEach(function (row) {
        var line = el('div', 'tooltip-row');
        var key = el('span', 'tooltip-key');
        var sw = el('span', 'swatch');
        sw.style.background = row.color;
        key.appendChild(sw);
        key.appendChild(document.createTextNode(row.label));
        line.appendChild(key);
        line.appendChild(el('b', null, compact(row.v)));
        tip.appendChild(line);
      });

      tip.classList.add('on');
      var left = (cx / CHART.w) * rect.width + 14;
      if (left + tip.offsetWidth > rect.width) left = (cx / CHART.w) * rect.width - tip.offsetWidth - 14;
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = (shell.clientHeight * 0.12) + 'px';
    }

    c.hit.addEventListener('mousemove', move);
    c.hit.addEventListener('mouseleave', hide);
    c.hit.addEventListener('touchmove', function (e) {
      if (e.touches.length) { move(e.touches[0]); e.preventDefault(); }
    }, { passive: false });
    c.hit.addEventListener('touchend', hide);
  }

  /* ===========================================================
     Holdings
     =========================================================== */

  var HOLDING_TYPES = [
    'Index fund', 'Individual stock', 'Bond / T-bill', 'Cash / HYSA',
    'Business asset', 'Inventory', 'Crypto', 'Other'
  ];

  function totals() {
    return state.holdings.reduce(function (acc, h) {
      acc.cost += num(h.cost, 0);
      acc.value += num(h.value, 0);
      return acc;
    }, { cost: 0, value: 0 });
  }

  var rowUpdaters = [];

  function renderHoldings() {
    var body = $('holdings-body');
    body.innerHTML = '';
    rowUpdaters = [];

    if (!state.holdings.length) {
      var empty = el('tr', 'empty-row');
      var td = el('td', null, 'Nothing here yet — add your first position to start tracking.');
      td.colSpan = 7;
      empty.appendChild(td);
      body.appendChild(empty);
    }

    state.holdings.forEach(function (h, i) {
      var tr = el('tr');

      tr.appendChild(cell(textInput(h.name, function (v) { h.name = v; }, 'Position name')));
      tr.appendChild(cell(selectInput(h.type, HOLDING_TYPES, function (v) { h.type = v; })));
      tr.appendChild(cell(numberInput(h.cost, function (v) { h.cost = v; onAmountEdit(); }), 'col-num'));
      tr.appendChild(cell(numberInput(h.value, function (v) { h.value = v; onAmountEdit(); }), 'col-num'));

      var gainTd = el('td', 'col-num');
      var retTd = el('td', 'col-num');
      tr.appendChild(gainTd);
      tr.appendChild(retTd);

      /* Redraw only the computed cells, so editing an amount never
         rebuilds the input the cursor is sitting in. */
      function updateRow() {
        var gain = num(h.value, 0) - num(h.cost, 0);
        var ret = num(h.cost, 0) > 0 ? (gain / num(h.cost, 0)) * 100 : 0;
        var dir = gain > 0 ? 'up' : gain < 0 ? 'down' : 'flat';
        gainTd.innerHTML = '';
        retTd.innerHTML = '';
        gainTd.appendChild(el('span', 'delta ' + dir, (gain > 0 ? '+' : '') + money(gain)));
        retTd.appendChild(el('span', 'delta ' + dir, (ret > 0 ? '+' : '') + pct(ret)));
      }
      updateRow();
      rowUpdaters.push(updateRow);

      var actTd = el('td', 'col-act');
      var del = el('button', 'icon-btn', '×');
      del.type = 'button';
      del.title = 'Remove ' + (h.name || 'this position');
      del.setAttribute('aria-label', 'Remove ' + (h.name || 'this position'));
      del.addEventListener('click', function () {
        state.holdings.splice(i, 1);
        save();
        renderHoldings();
        refreshDerived();
      });
      actTd.appendChild(del);
      tr.appendChild(actTd);

      body.appendChild(tr);
    });

    renderHoldingsFoot();
  }

  /* Called on every keystroke in an amount cell. */
  function onAmountEdit() {
    rowUpdaters.forEach(function (fn) { fn(); });
    renderHoldingsFoot();
    refreshDerived();
  }

  function renderHoldingsFoot() {
    var foot = $('holdings-foot');
    foot.innerHTML = '';

    var t = totals();
    var gain = t.value - t.cost;
    var ret = t.cost > 0 ? (gain / t.cost) * 100 : 0;
    var dir = gain > 0 ? 'up' : gain < 0 ? 'down' : 'flat';

    var ftr = el('tr');
    var label = el('td', null, 'Total');
    label.colSpan = 2;
    ftr.appendChild(label);
    ftr.appendChild(el('td', 'col-num', money(t.cost)));
    ftr.appendChild(el('td', 'col-num', money(t.value)));
    var fg = el('td', 'col-num');
    fg.appendChild(el('span', 'delta ' + dir, (gain > 0 ? '+' : '') + money(gain)));
    ftr.appendChild(fg);
    var fr = el('td', 'col-num');
    fr.appendChild(el('span', 'delta ' + dir, (ret > 0 ? '+' : '') + pct(ret)));
    ftr.appendChild(fr);
    ftr.appendChild(el('td', 'col-act'));
    foot.appendChild(ftr);
  }

  function cell(child, className) {
    var td = el('td', className);
    td.appendChild(child);
    return td;
  }

  function textInput(value, onChange, label) {
    var input = el('input', 'cell-input');
    input.type = 'text';
    input.value = value || '';
    if (label) input.setAttribute('aria-label', label);
    input.addEventListener('input', function () { onChange(input.value); save(); });
    return input;
  }

  function numberInput(value, onChange) {
    var input = el('input', 'cell-input col-num');
    input.type = 'number';
    input.step = '1';
    input.min = '0';
    input.inputMode = 'decimal';
    input.value = num(value, 0);
    input.setAttribute('aria-label', 'Amount in dollars');
    input.addEventListener('input', function () {
      onChange(num(input.value, 0));
      save();
    });
    return input;
  }

  function selectInput(value, options, onChange) {
    var sel = el('select', 'cell-input');
    sel.setAttribute('aria-label', 'Holding type');
    options.forEach(function (o) {
      var opt = el('option', null, o);
      opt.value = o;
      if (o === value) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () { onChange(sel.value); save(); });
    return sel;
  }

  /* ===========================================================
     Ventures
     =========================================================== */

  var STATUSES = ['idea', 'research', 'building', 'earning'];
  var STATUS_LABEL = {
    idea: 'Idea', research: 'Researching', building: 'Building', earning: 'Earning'
  };

  function renderVentures() {
    var grid = $('ventures-grid');
    grid.innerHTML = '';

    state.ventures.forEach(function (v, i) {
      var card = el('article', 'venture');

      var top = el('div', 'venture-top');
      var titleWrap = el('div');
      titleWrap.appendChild(el('h3', null, v.name));
      titleWrap.appendChild(el('p', 'venture-cat', v.cat));
      top.appendChild(titleWrap);

      var pill = el('button', 'pill status-' + v.status, STATUS_LABEL[v.status] || v.status);
      pill.type = 'button';
      pill.title = 'Click to advance status';
      pill.addEventListener('click', function () {
        var next = (STATUSES.indexOf(v.status) + 1) % STATUSES.length;
        v.status = STATUSES[next];
        save();
        renderVentures();
        renderGoal();
      });
      top.appendChild(pill);
      card.appendChild(top);

      var midProfit = (num(v.profitLow, 0) + num(v.profitHigh, 0)) / 2;
      var perHour = v.hours > 0 ? midProfit / (v.hours * WEEKS_PER_MONTH) : null;

      var stats = el('dl', 'venture-stats');
      addStat(stats, 'Startup cost', v.costLow === v.costHigh
        ? money(v.costLow)
        : money(v.costLow) + '–' + money(v.costHigh));
      addStat(stats, 'First money in', v.weeks === 0 ? 'immediate' : v.weeks + ' wk');
      addStat(stats, 'Profit / month', money(v.profitLow) + '–' + money(v.profitHigh));
      addStat(stats, 'Per hour worked', perHour === null ? 'passive' : usd0.format(perHour) + '/h');
      card.appendChild(stats);

      var weekly = midProfit / WEEKS_PER_MONTH;
      var share = state.target > 0 ? Math.min(weekly / state.target, 1) : 0;

      var meterWrap = el('div', 'venture-meter');
      var mLabel = el('div', 'venture-meter-label');
      mLabel.appendChild(el('span', null, 'Toward ' + money(state.target) + '/wk'));
      var b = el('b', null, money(weekly) + '/wk · ' + pct(share * 100, 0));
      mLabel.appendChild(b);
      meterWrap.appendChild(mLabel);
      var meter = el('div', 'meter');
      var fill = el('div', 'meter-fill');
      fill.style.width = (share * 100) + '%';
      meter.appendChild(fill);
      meterWrap.appendChild(meter);
      card.appendChild(meterWrap);

      card.appendChild(el('p', 'venture-note', v.note));

      var foot = el('div', 'venture-foot');
      foot.appendChild(el('span', 'risk ' + v.risk, v.risk + ' risk'));
      var del = el('button', 'icon-btn', '×');
      del.type = 'button';
      del.setAttribute('aria-label', 'Remove ' + v.name);
      del.addEventListener('click', function () {
        state.ventures.splice(i, 1);
        save();
        renderVentures();
        renderGoal();
      });
      foot.appendChild(del);
      card.appendChild(foot);

      grid.appendChild(card);
    });
  }

  function addStat(dl, term, value) {
    var wrap = el('div', 'stat');
    wrap.appendChild(el('dt', null, term));
    wrap.appendChild(el('dd', null, value));
    dl.appendChild(wrap);
  }

  /* ===========================================================
     Ladder
     =========================================================== */

  function renderLadder() {
    var list = $('ladder-list');
    list.innerHTML = '';

    state.ladder.forEach(function (rung, i) {
      var li = el('li', 'rung' + (rung.done ? ' done' : ''));

      li.appendChild(el('span', 'rung-mark', String(i + 1)));

      var mid = el('div');
      mid.appendChild(el('p', 'rung-title', rung.title));
      mid.appendChild(el('p', 'rung-detail', rung.detail));
      li.appendChild(mid);

      var right = el('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '.75rem';
      right.appendChild(el('span', 'rung-target', money(state.target * rung.share) + '/wk'));

      var box = el('input', 'rung-check');
      box.type = 'checkbox';
      box.checked = !!rung.done;
      box.setAttribute('aria-label', 'Mark "' + rung.title + '" reached');
      box.addEventListener('change', function () {
        rung.done = box.checked;
        save();
        renderLadder();
      });
      right.appendChild(box);
      li.appendChild(right);

      list.appendChild(li);
    });
  }

  /* ===========================================================
     Wiring
     =========================================================== */

  /* Everything that depends on the headline numbers rather than
     on list membership — cheap enough to run on every keystroke. */
  function refreshDerived() {
    renderMath();
    renderGoal();
    renderChart();
  }

  function renderAll() {
    renderHoldings();
    renderVentures();
    renderLadder();
    refreshDerived();
  }

  function bindNumberField(id, key, opts) {
    var input = $(id);
    input.value = state[key];
    input.addEventListener('input', function () {
      var v = num(input.value, state[key]);
      if (opts && opts.min !== undefined) v = Math.max(opts.min, v);
      if (opts && opts.max !== undefined) v = Math.min(opts.max, v);
      state[key] = v;
      save();
      if (opts && opts.full) renderAll(); else refreshDerived();
    });
  }

  function bindTheme() {
    var btn = $('theme-btn');
    var root = document.documentElement;

    function currentIsDark() {
      var stamped = root.getAttribute('data-theme');
      if (stamped) return stamped === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function sync() { btn.textContent = currentIsDark() ? 'Light' : 'Dark'; }

    try {
      var saved = localStorage.getItem(STORE + ':theme');
      if (saved) root.setAttribute('data-theme', saved);
    } catch (e) { /* storage unavailable */ }
    sync();

    btn.addEventListener('click', function () {
      var next = currentIsDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORE + ':theme', next); } catch (e) { /* storage unavailable */ }
      sync();
      renderChart();
    });
  }

  function init() {
    state = load();

    bindNumberField('in-capital', 'capital', { min: 0 });
    bindNumberField('in-target',  'target',  { min: 0, full: true });
    bindNumberField('in-current', 'current', { min: 0, full: true });
    bindNumberField('in-monthly', 'monthly', { min: 0 });
    bindNumberField('in-years',   'years',   { min: 5, max: 50 });

    $('add-holding').addEventListener('click', function () {
      state.holdings.push({ name: 'New position', type: 'Index fund', cost: 0, value: 0 });
      save();
      renderHoldings();
      refreshDerived();
      var inputs = $('holdings-body').querySelectorAll('tr:last-child .cell-input');
      if (inputs.length) { inputs[0].focus(); inputs[0].select(); }
    });

    $('add-venture').addEventListener('click', function () {
      state.ventures.push({
        name: 'New venture', cat: 'Service', status: 'idea',
        costLow: 0, costHigh: 500, weeks: 4, profitLow: 0, profitHigh: 1000,
        hours: 10, risk: 'medium',
        note: 'What is it, who pays for it, and what does the first $1 cost you to earn?'
      });
      save();
      renderVentures();
    });

    $('reset-btn').addEventListener('click', function () {
      if (!window.confirm('Reset every number back to the starting example? This cannot be undone.')) return;
      state = clone(SEED);
      save();
      $('in-capital').value = state.capital;
      $('in-target').value  = state.target;
      $('in-current').value = state.current;
      $('in-monthly').value = state.monthly;
      $('in-years').value   = state.years;
      renderAll();
    });

    bindTheme();
    renderAll();

    window.addEventListener('resize', function () {
      if (chartCache) renderChart();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
