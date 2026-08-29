/* ============================================================================
   HEATLIST — client logic. No build step, no dependencies.
   Reads CITY / STORES / MODELS / STOCK from data.js. Swap those for fetch()
   calls and nothing here changes except where the data comes from.
   ========================================================================== */

const modelById = (id) => MODELS.find((m) => m.id === id);
const storeById = (id) => STORES.find((s) => s.id === id);
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function median(nums) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = a.length >> 1;
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

/* ---------- ranking: what actually sells ---------------------------------
   Heat is never typed in by hand. It comes out of two measured facts about
   the Miami market: how many units moved in 30 days, and how fast one piece
   clears the floor. Volume without speed is a slow mover. Speed without
   volume is a one-off. Something is hot only when it does both, so the two
   are blended rather than averaged into a single count.
   ------------------------------------------------------------------------ */

const VOLUME_TOP = 30;   // units/30d that counts as a full-marks mover
const SLOW_DAYS  = 60;   // days-to-sell at which speed scores zero

function heatOf(model) {
  const volume = clamp(model.sold30 / VOLUME_TOP, 0, 1);
  const speed = clamp((SLOW_DAYS - model.days) / (SLOW_DAYS - 3), 0, 1);
  return clamp(1 + 4 * (0.6 * volume + 0.4 * speed), 1, 5);
}

/* Cache it — every card, sort and pin asks for this. */
const HEAT = Object.fromEntries(MODELS.map((m) => [m.id, heatOf(m)]));

/* ---------- price: who is actually cheapest ------------------------------ */

/** Median asking price for a model across every tracked Miami store. */
const CITY_MEDIAN = Object.fromEntries(MODELS.map((m) => [
  m.id, median(STOCK.filter((s) => s.modelId === m.id).map((s) => s.price))
]));

/** The single cheapest listing of a model in the city, for the badge. */
const BEST_PRICE = Object.fromEntries(MODELS.map((m) => {
  const rows = STOCK.filter((s) => s.modelId === m.id);
  return [m.id, rows.reduce((lo, r) => (r.price < lo.price ? r : lo), rows[0]).id];
}));

/** How far under (+) or over (-) the city median this listing is asking. */
const vsMedian = (row) =>
  Math.round(((CITY_MEDIAN[row.modelId] - row.price) / CITY_MEDIAN[row.modelId]) * 100);

/** How far under (+) or over (-) market comp this listing is asking. */
const vsComp = (row) => {
  const { comp } = modelById(row.modelId);
  return Math.round(((comp - row.price) / comp) * 100);
};

/**
 * A store's typical position against the rest of Miami on the same models.
 * 0.94 means it asks ~6% below the city median on the things it carries.
 * Only models stocked by more than one store can say anything about a
 * store's pricing, so single-source pieces are left out.
 */
function priceIndex(store) {
  const ratios = STOCK
    .filter((s) => s.storeId === store.id)
    .filter((s) => STOCK.filter((o) => o.modelId === s.modelId).length > 1)
    .map((s) => s.price / CITY_MEDIAN[s.modelId]);
  return ratios.length ? median(ratios) : null;
}

/** Plain-English version of the price index, for a store card. */
function priceBlurb(idx) {
  const pct = Math.round(Math.abs(1 - idx) * 100);
  if (pct === 0) return 'Asks right at the Miami median on shared models';
  return `Asks ${pct}% ${idx < 1 ? 'below' : 'above'} the Miami median on shared models`;
}

/** Price index as a 1-5 rating: 15% over the city = 1★, 15% under = 5★. */
function priceStars(store) {
  const idx = priceIndex(store);
  return idx === null ? null : clamp(1 + ((1.15 - idx) / 0.3) * 4, 1, 5);
}

/** Live floor heat: the average of a store's three hottest models. */
function floorHeat(storeId) {
  const hot = STOCK.filter((s) => s.storeId === storeId)
    .map((s) => HEAT[s.modelId]).sort((a, b) => b - a).slice(0, 3);
  return hot.length ? hot.reduce((a, b) => a + b, 0) / hot.length : 0;
}

function isOpen(store, now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= store.hours[0] && h < store.hours[1];
}

const daysSince = (iso) =>
  Math.round((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86400000);

/* ---------- tiny view helpers ------------------------------------------- */

function stars(value) {
  const filled = Math.round(value);
  let out = '';
  for (let i = 1; i <= 5; i++) out += i <= filled ? '★' : '<span class="off">★</span>';
  return `<span class="stars" title="${value.toFixed(1)} of 5">${out}</span>`;
}

const bar = (label, value) =>
  `<div class="bar-row"><span>${label}</span>
    <span class="bar"><i style="width:${(value / 5) * 100}%"></i></span>
    <span>${value.toFixed(1)}</span></div>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** "27% under comp" / "8% over" with the right colour. */
const pctTag = (pct, unit) =>
  `<span class="deal ${pct >= 0 ? 'under' : 'over'}">${
    pct >= 0 ? pct + '% under ' + unit : Math.abs(pct) + '% over ' + unit}</span>`;

/* ---------- saved items (per browser) ----------------------------------- */

const saved = {
  ids: new Set(),
  load() {
    try { this.ids = new Set(JSON.parse(localStorage.getItem('heatlist:saved') || '[]')); }
    catch { this.ids = new Set(); }
  },
  toggle(id) {
    this.ids.has(id) ? this.ids.delete(id) : this.ids.add(id);
    try { localStorage.setItem('heatlist:saved', JSON.stringify([...this.ids])); } catch {}
  }
};
saved.load();

/* ---------- filter state ------------------------------------------------ */

const state = {
  q: '', brands: new Set(), hood: '', cat: '', heat: 0, price: 0,
  sort: 'heat', openOnly: false, view: 'items'
};

function matches(row) {
  const model = modelById(row.modelId);
  const store = storeById(row.storeId);
  if (state.brands.size && !state.brands.has(model.brand)) return false;
  if (state.hood && store.hood !== state.hood) return false;
  if (state.cat && model.cat !== state.cat) return false;
  if (HEAT[model.id] < state.heat) return false;
  if (state.price && row.price > state.price) return false;
  if (state.openOnly && !isOpen(store)) return false;
  if (state.q) {
    const hay = `${model.brand} ${model.name} ${model.cat} ${store.name} ${store.hood}`;
    if (!hay.toLowerCase().includes(state.q)) return false;
  }
  return true;
}

const SORTERS = {
  heat: (a, b) => HEAT[b.modelId] - HEAT[a.modelId] || vsMedian(b) - vsMedian(a),
  deal: (a, b) => vsComp(b) - vsComp(a),
  under: (a, b) => vsMedian(b) - vsMedian(a),
  fresh: (a, b) => a.daysIn - b.daysIn,
  near: (a, b) => storeById(a.storeId).distanceMi - storeById(b.storeId).distanceMi,
  cheap: (a, b) => a.price - b.price
};

const visibleStock = () => STOCK.filter(matches).sort(SORTERS[state.sort]);

function visibleStores() {
  const live = new Set(visibleStock().map((s) => s.storeId));
  return STORES.filter((s) => live.has(s.id))
    .sort((a, b) => floorHeat(b.id) - floorHeat(a.id));
}

/** Models that survive the filters, ranked by how well they sell. */
function visibleModels() {
  const live = new Set(visibleStock().map((s) => s.modelId));
  return MODELS.filter((m) => live.has(m.id))
    .sort((a, b) => HEAT[b.id] - HEAT[a.id]);
}

/* ---------- renderers --------------------------------------------------- */

function stockCard(row) {
  const model = modelById(row.modelId);
  const store = storeById(row.storeId);
  const isSaved = saved.ids.has(row.id);
  const listings = STOCK.filter((s) => s.modelId === model.id).length;
  return `<article class="card">
    <div class="card-top">
      <div>
        <p class="brand">${esc(model.brand)}</p>
        <h3 class="item-name">${esc(model.name)}</h3>
      </div>
      ${stars(HEAT[model.id])}
    </div>
    <p class="meta">${esc(model.cat)} · Size ${esc(row.size)} · ${esc(row.cond)}</p>
    <p class="sells">Sells in ~${model.days}d · ${model.sold30} sold in Miami this month</p>
    <div class="badges">
      ${BEST_PRICE[model.id] === row.id && listings > 1
        ? '<span class="badge best">Best price in Miami</span>' : ''}
      ${row.daysIn <= 7 ? '<span class="badge fresh">Just landed</span>' : ''}
      ${row.daysIn > 30 ? `<span class="badge stale">Sitting ${row.daysIn}d</span>` : ''}
      <span class="badge">${store.distanceMi} mi</span>
      <span class="badge">${esc(store.hood)}</span>
    </div>
    <div class="price-row">
      <span class="price">${money(row.price)}</span>
      <span class="comp">${money(model.comp)}</span>
      ${pctTag(vsComp(row), 'comp')}
    </div>
    ${listings > 1
      ? `<button class="compare-link" data-model="${model.id}">
           ${pctTag(vsMedian(row), 'Miami median')} · compare ${listings} stores →
         </button>` : ''}
    <div class="store-line">
      <button class="store-link" data-store="${store.id}">${esc(store.name)}</button>
      <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${row.id}"
        aria-label="${isSaved ? 'Remove from saved' : 'Save item'}">${isSaved ? '★' : '☆'}</button>
    </div>
  </article>`;
}

function storeCard(store) {
  const open = isOpen(store);
  const stale = daysSince(store.verified);
  const count = STOCK.filter((s) => s.storeId === store.id && matches(s)).length;
  const pStars = priceStars(store);
  const idx = priceIndex(store);
  return `<article class="card">
    <div class="card-top">
      <div>
        <h3 class="store-name">${esc(store.name)}</h3>
        <p class="meta">${esc(store.hood)} · ${store.distanceMi} mi</p>
      </div>
      ${stars(floorHeat(store.id))}
    </div>
    <p class="open-dot ${open ? 'yes' : 'no'}">${open ? '● Open now' : '○ Closed'} · ${store.hours[0]}:00–${store.hours[1]}:00</p>
    <div class="rating-bars">
      ${bar('Heat on floor', floorHeat(store.id))}
      ${pStars === null ? '' : bar('Prices', pStars)}
      ${bar('Pays sellers', store.payout)}
    </div>
    ${idx === null ? '' : `<p class="sells">${priceBlurb(idx)}</p>`}
    <div class="badges">${store.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join('')}</div>
    <div class="store-line">
      <button class="store-link" data-store="${store.id}">${count} matching ${count === 1 ? 'piece' : 'pieces'} →</button>
      <span class="meta">${stale <= 2 ? 'Checked today' : 'Checked ' + stale + 'd ago'}</span>
    </div>
  </article>`;
}

/** Compare view: what Miami is buying, and the price spread on each piece. */
function compareRow(model, rank) {
  const rows = STOCK.filter((s) => s.modelId === model.id).sort((a, b) => a.price - b.price);
  const low = rows[0], high = rows[rows.length - 1];
  const spread = rows.length > 1 ? Math.round(((high.price - low.price) / low.price) * 100) : 0;
  return `<button class="rank-row" data-model="${model.id}">
    <span class="rank">${rank}</span>
    <span class="rank-main">
      <span class="brand">${esc(model.brand)}</span>
      <span class="item-name">${esc(model.name)}</span>
      <span class="sells">${model.sold30} sold / 30d · clears in ~${model.days}d · ${rows.length} store${rows.length === 1 ? '' : 's'}</span>
    </span>
    <span class="rank-heat">${stars(HEAT[model.id])}</span>
    <span class="rank-price">
      <strong>${money(low.price)}</strong>
      <span class="meta">${esc(storeById(low.storeId).name)}</span>
      ${spread ? `<span class="badge spread">${spread}% spread</span>` : ''}
    </span>
  </button>`;
}

let selectedPin = null;

function renderPins() {
  const live = new Set(visibleStores().map((s) => s.id));
  document.getElementById('pins').innerHTML = STORES.map((s) => {
    const h = floorHeat(s.id);
    // amber for a quiet floor, deep red for a hot one
    const shade = `hsl(${50 - h * 9} 88% ${66 - h * 5}%)`;
    return `<button class="pin ${live.has(s.id) ? '' : 'dim'} ${s.id === selectedPin ? 'sel' : ''}"
      style="left:${s.x}%;top:${s.y}%"
      data-store="${s.id}" aria-label="${esc(s.name)}">
      <span class="dot" style="background:${shade}"><b>${h.toFixed(1)}</b></span>
      <span class="label">${esc(s.name)}</span>
    </button>`;
  }).join('');
}

function renderMapSide(storeId) {
  const side = document.getElementById('map-side');
  selectedPin = storeId;
  renderPins();

  if (!storeId) {
    const ranked = [...STORES].sort((a, b) => floorHeat(b.id) - floorHeat(a.id));
    side.innerHTML = `<h3>${esc(CITY.name)} floors, hottest first</h3>
      <p class="meta">Pin colour is live floor heat — amber is quiet, red is moving.</p>
      ${ranked.map((s) => `<button class="side-row" data-pin="${s.id}">
        <span>${esc(s.name)}<br><span class="meta">${esc(s.hood)} · ${s.distanceMi} mi</span></span>
        <span>${stars(floorHeat(s.id))}</span>
      </button>`).join('')}`;
    return;
  }
  const s = storeById(storeId);
  const rows = STOCK.filter((r) => r.storeId === storeId)
    .sort((a, b) => HEAT[b.modelId] - HEAT[a.modelId]);
  side.innerHTML = `<button class="back-link" data-pin="">← all ${STORES.length} stores</button>
    <h3>${esc(s.name)}</h3>
    <p class="meta">${esc(s.hood)} · ${esc(s.address)}</p>
    <p style="margin:.5rem 0">${stars(floorHeat(s.id))}
      <span class="meta">${s.reviews} seller reports</span></p>
    ${rows.map((r) => {
      const m = modelById(r.modelId);
      return `<div class="mini-item"><span>${esc(m.brand)} — ${esc(m.name)}</span>
        <strong>${money(r.price)}</strong></div>`;
    }).join('')}
    <p style="margin-top:1rem"><button class="btn-ghost" data-store="${s.id}">Full store profile</button></p>`;
}

/* ---------- detail sheets ----------------------------------------------- */

function showSheet(html) {
  const sheet = document.getElementById('sheet');
  sheet.innerHTML = `<button class="close" id="sheet-close" aria-label="Close">×</button>${html}`;
  sheet.hidden = false;
  sheet.scrollTop = 0;
  document.getElementById('backdrop').hidden = false;
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
}

function closeSheet() {
  document.getElementById('sheet').hidden = true;
  document.getElementById('backdrop').hidden = true;
}

function openStoreSheet(storeId) {
  const s = storeById(storeId);
  const rows = STOCK.filter((r) => r.storeId === storeId)
    .sort((a, b) => HEAT[b.modelId] - HEAT[a.modelId]);
  const pStars = priceStars(s);
  const brands = [...new Set(rows.map((r) => modelById(r.modelId).brand))];
  showSheet(`
    <p class="brand">${esc(s.hood)}, ${CITY.name}</p>
    <h2>${esc(s.name)}</h2>
    <p class="meta">${esc(s.address)} · ${s.distanceMi} mi · ${isOpen(s) ? 'open now' : 'closed'}</p>
    <p style="margin-top:.6rem">${stars(floorHeat(s.id))}
      <span class="meta">inventory checked ${daysSince(s.verified)}d ago</span></p>
    <section><h4>How it rates</h4><div class="rating-bars">
      ${bar('Heat on floor', floorHeat(s.id))}
      ${pStars === null ? '' : bar('Prices', pStars)}
      ${bar('Pays sellers', s.payout)}
    </div>
    <p class="meta" style="margin-top:.5rem">Heat and prices are computed from
      what sells in ${CITY.name} and what every other store asks for the same
      models. Payout is reported by ${s.reviews} sellers.</p></section>
    <section><h4>Carries</h4><div class="badges">
      ${brands.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}
    </div></section>
    <section><h4>On the floor (${rows.length})</h4>
      ${rows.map((r) => {
        const m = modelById(r.modelId);
        return `<div class="mini-item">
          <span>${stars(HEAT[m.id])}<br>
            <span class="meta">${esc(m.brand)} — ${esc(m.name)} · ${esc(r.size)}</span></span>
          <span style="text-align:right"><strong>${money(r.price)}</strong><br>
            ${pctTag(vsComp(r), 'comp')}</span>
        </div>`;
      }).join('')}
    </section>`);
}

function openModelSheet(modelId) {
  const m = modelById(modelId);
  const rows = STOCK.filter((r) => r.modelId === modelId).sort((a, b) => a.price - b.price);
  showSheet(`
    <p class="brand">${esc(m.brand)}</p>
    <h2>${esc(m.name)}</h2>
    <p class="meta">${esc(m.cat)} · comp ${money(m.comp)} · Miami median ${money(CITY_MEDIAN[m.id])}</p>
    <p style="margin-top:.6rem">${stars(HEAT[m.id])}
      <span class="meta">${m.sold30} sold in ${CITY.name} in 30 days, clearing in ~${m.days} days</span></p>
    <section><h4>Who has it, cheapest first</h4>
      ${rows.map((r, i) => {
        const s = storeById(r.storeId);
        return `<div class="mini-item">
          <span>${i === 0 && rows.length > 1 ? '<span class="badge best">Best</span> ' : ''}
            <button class="store-link" data-store="${s.id}">${esc(s.name)}</button><br>
            <span class="meta">${esc(s.hood)} · ${s.distanceMi} mi · ${esc(r.size)} · ${esc(r.cond)}</span></span>
          <span style="text-align:right"><strong>${money(r.price)}</strong><br>
            ${pctTag(vsMedian(r), 'median')}</span>
        </div>`;
      }).join('')}
      <p class="meta" style="margin-top:.6rem">Condition and size differ between
        listings — cheapest is not automatically the best buy.</p>
    </section>`);
}

/* ---------- top-level render -------------------------------------------- */

function render() {
  const rows = visibleStock();
  const stores = visibleStores();
  const models = visibleModels();

  document.getElementById('items-grid').innerHTML = rows.map(stockCard).join('');
  document.getElementById('stores-grid').innerHTML = stores.map(storeCard).join('');
  document.getElementById('compare-list').innerHTML =
    models.map((m, i) => compareRow(m, i + 1)).join('');

  const savedRows = STOCK.filter((r) => saved.ids.has(r.id));
  document.getElementById('saved-grid').innerHTML = savedRows.length
    ? savedRows.map(stockCard).join('')
    : '<p class="empty">Nothing saved yet. Tap ☆ on a piece to watch it.</p>';

  document.getElementById('count-items').textContent = rows.length;
  document.getElementById('count-stores').textContent = stores.length;
  document.getElementById('count-compare').textContent = models.length;
  document.getElementById('count-saved').textContent = savedRows.length;

  const sold = models.reduce((a, m) => a + m.sold30, 0);
  const best = rows.length ? Math.max(...rows.map(vsComp)) : 0;
  document.getElementById('stats').innerHTML = `
    <div><dt>On the floor</dt><dd>${rows.length}</dd></div>
    <div><dt>Sold / 30d</dt><dd>${sold}</dd></div>
    <div><dt>Stores</dt><dd>${stores.length}</dd></div>
    <div><dt>Best deal</dt><dd>${best}%</dd></div>`;

  renderPins();
  document.getElementById('empty').hidden = !(state.view === 'items' && rows.length === 0);
}

/* ---------- wiring ------------------------------------------------------ */

// Filter options are built from the data, so adding a city or a brand to
// data.js is enough — no markup to keep in sync.
const brands = [...new Set(MODELS.map((m) => m.brand))].sort();
document.getElementById('brand-chips').innerHTML =
  brands.map((b) => `<button class="chip" data-brand="${esc(b)}">${esc(b)}</button>`).join('');

const stocked = new Set(STORES.map((s) => s.hood));
document.getElementById('f-hood').innerHTML =
  `<option value="">All ${esc(CITY.name)}</option>` +
  CITY.hoods.filter((h) => stocked.has(h)).map((h) => `<option>${esc(h)}</option>`).join('');

document.getElementById('f-cat').innerHTML = '<option value="">All</option>' +
  [...new Set(MODELS.map((m) => m.cat))].sort().map((c) => `<option>${esc(c)}</option>`).join('');

document.getElementById('city-name').textContent = CITY.name;
document.getElementById('city-note').textContent =
  `${CITY.name} only for now — ${SOON.join(', ')} next.`;

document.getElementById('brand-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const b = chip.dataset.brand;
  state.brands.has(b) ? state.brands.delete(b) : state.brands.add(b);
  chip.classList.toggle('on');
  render();
});

document.getElementById('search').addEventListener('input', (e) => {
  state.q = e.target.value.trim().toLowerCase();
  render();
});

const bind = (id, key, cast = (v) => v) =>
  document.getElementById(id).addEventListener('change', (e) => {
    state[key] = cast(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    render();
  });
bind('f-hood', 'hood');
bind('f-cat', 'cat');
bind('f-heat', 'heat', Number);
bind('f-price', 'price', Number);
bind('f-sort', 'sort');
bind('f-open', 'openOnly');

document.getElementById('reset').addEventListener('click', () => {
  Object.assign(state, {
    q: '', brands: new Set(), hood: '', cat: '', heat: 0, price: 0,
    sort: 'heat', openOnly: false
  });
  document.getElementById('search').value = '';
  ['f-hood', 'f-cat'].forEach((id) => { document.getElementById(id).value = ''; });
  ['f-heat', 'f-price'].forEach((id) => { document.getElementById(id).value = '0'; });
  document.getElementById('f-sort').value = 'heat';
  document.getElementById('f-open').checked = false;
  document.querySelectorAll('.chip.on').forEach((c) => c.classList.remove('on'));
  render();
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    state.view = tab.dataset.view;
    ['items', 'stores', 'compare', 'map', 'saved'].forEach((v) => {
      document.getElementById('view-' + v).hidden = v !== state.view;
    });
    document.getElementById('filters').hidden = state.view === 'saved';
    render();
  });
});

// one delegated handler for pins, store links, model links and save stars
document.addEventListener('click', (e) => {
  const pin = e.target.closest('.pin');
  if (pin) { renderMapSide(pin.dataset.store); return; }

  const sideRow = e.target.closest('[data-pin]');
  if (sideRow) { renderMapSide(sideRow.dataset.pin || null); return; }

  const model = e.target.closest('[data-model]');
  if (model) { openModelSheet(model.dataset.model); return; }

  const store = e.target.closest('[data-store]');
  if (store) { openStoreSheet(store.dataset.store); return; }

  const save = e.target.closest('[data-save]');
  if (save) { saved.toggle(save.dataset.save); render(); }
});

document.getElementById('backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

// theme, remembered between visits
const rootEl = document.documentElement;
try {
  const t = localStorage.getItem('heatlist:theme');
  if (t) rootEl.setAttribute('data-theme', t);
} catch {}
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = rootEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  rootEl.setAttribute('data-theme', next);
  try { localStorage.setItem('heatlist:theme', next); } catch {}
});

renderMapSide(null);
render();
