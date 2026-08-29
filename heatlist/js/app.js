/* ============================================================================
   HEATLIST — client logic. No build step, no dependencies.
   Reads the arrays in data.js. Swap those for fetch() calls and nothing here
   has to change except where the data comes from.
   ========================================================================== */

/* ---------- scoring ----------------------------------------------------- */

/** How far under (positive) or over (negative) market the asking price is. */
function dealPct(item) {
  return Math.round(((item.comp - item.price) / item.comp) * 100);
}

/** Live floor heat for a store: the average of its three hottest pieces. */
function liveHeat(storeId) {
  const hot = ITEMS.filter((i) => i.storeId === storeId)
    .map((i) => i.heat)
    .sort((a, b) => b - a)
    .slice(0, 3);
  if (!hot.length) return 0;
  return hot.reduce((a, b) => a + b, 0) / hot.length;
}

function isOpen(store, now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= store.hours[0] && h < store.hours[1];
}

function daysSince(iso) {
  return Math.round((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86400000);
}

const storeById = (id) => STORES.find((s) => s.id === id);
const money = (n) => '$' + n.toLocaleString('en-US');

/* ---------- tiny view helpers ------------------------------------------- */

function stars(value) {
  const filled = Math.round(value);
  let out = '';
  for (let i = 1; i <= 5; i++) out += i <= filled ? '★' : '<span class="off">★</span>';
  return `<span class="stars" title="${value.toFixed(1)} of 5">${out}</span>`;
}

function bar(label, value) {
  return `<div class="bar-row"><span>${label}</span>
    <span class="bar"><i style="width:${(value / 5) * 100}%"></i></span>
    <span>${value.toFixed(1)}</span></div>`;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

const state = { q: '', brands: new Set(), cat: '', heat: 0, price: 0, sort: 'heat', openOnly: false, view: 'items' };

function matches(item) {
  const store = storeById(item.storeId);
  if (state.brands.size && !state.brands.has(item.brand)) return false;
  if (state.cat && item.cat !== state.cat) return false;
  if (item.heat < state.heat) return false;
  if (state.price && item.price > state.price) return false;
  if (state.openOnly && !isOpen(store)) return false;
  if (state.q) {
    const hay = `${item.brand} ${item.name} ${item.cat} ${store.name} ${store.hood}`.toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}

const SORTERS = {
  heat: (a, b) => b.heat - a.heat || dealPct(b) - dealPct(a),
  deal: (a, b) => dealPct(b) - dealPct(a),
  fresh: (a, b) => a.daysIn - b.daysIn,
  near: (a, b) => storeById(a.storeId).distanceMi - storeById(b.storeId).distanceMi,
  cheap: (a, b) => a.price - b.price
};

function visibleItems() {
  return ITEMS.filter(matches).sort(SORTERS[state.sort]);
}

function visibleStores() {
  const withItems = new Set(visibleItems().map((i) => i.storeId));
  return STORES.filter((s) => withItems.has(s.id))
    .sort((a, b) => liveHeat(b.id) - liveHeat(a.id));
}

/* ---------- renderers --------------------------------------------------- */

function itemCard(item) {
  const store = storeById(item.storeId);
  const pct = dealPct(item);
  const isSaved = saved.ids.has(item.id);
  return `<article class="card">
    <div class="card-top">
      <div>
        <p class="brand">${esc(item.brand)}</p>
        <h3 class="item-name">${esc(item.name)}</h3>
      </div>
      ${stars(item.heat)}
    </div>
    <p class="meta">${esc(item.cat)} · Size ${esc(item.size)} · ${esc(item.cond)}</p>
    <div class="badges">
      ${item.daysIn <= 7 ? '<span class="badge fresh">Just landed</span>' : ''}
      ${item.daysIn > 30 ? '<span class="badge stale">Sitting ' + item.daysIn + 'd</span>' : ''}
      <span class="badge">${store.distanceMi} mi</span>
      <span class="badge">${esc(store.hood)}</span>
    </div>
    <div class="price-row">
      <span class="price">${money(item.price)}</span>
      <span class="comp">${money(item.comp)}</span>
      <span class="deal ${pct >= 0 ? 'under' : 'over'}">${pct >= 0 ? pct + '% under comp' : Math.abs(pct) + '% over'}</span>
    </div>
    <div class="store-line">
      <button class="store-link" data-store="${store.id}">${esc(store.name)}</button>
      <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${item.id}"
        aria-label="${isSaved ? 'Remove from saved' : 'Save item'}">${isSaved ? '★' : '☆'}</button>
    </div>
  </article>`;
}

function storeCard(store) {
  const open = isOpen(store);
  const stale = daysSince(store.verified);
  const count = ITEMS.filter((i) => i.storeId === store.id && matches(i)).length;
  return `<article class="card">
    <div class="card-top">
      <div>
        <h3 class="store-name">${esc(store.name)}</h3>
        <p class="meta">${esc(store.hood)} · ${store.distanceMi} mi</p>
      </div>
      ${stars(liveHeat(store.id))}
    </div>
    <p class="open-dot ${open ? 'yes' : 'no'}">${open ? '● Open now' : '○ Closed'} · ${store.hours[0]}:00–${store.hours[1]}:00</p>
    <div class="rating-bars">
      ${bar('Heat on floor', store.stock)}
      ${bar('Pays sellers', store.payout)}
      ${bar('Fair pricing', store.pricing)}
    </div>
    <div class="badges">${store.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join('')}</div>
    <div class="store-line">
      <button class="store-link" data-store="${store.id}">${count} matching ${count === 1 ? 'piece' : 'pieces'} →</button>
      <span class="meta">${stale <= 2 ? 'Checked today' : 'Checked ' + stale + 'd ago'}</span>
    </div>
  </article>`;
}

function renderPins() {
  const live = new Set(visibleStores().map((s) => s.id));
  document.getElementById('pins').innerHTML = STORES.map((s) => {
    const h = liveHeat(s.id);
    // amber for a quiet floor, deep red for a hot one
    const shade = `hsl(${50 - h * 9} 88% ${66 - h * 5}%)`;
    return `<button class="pin ${live.has(s.id) ? '' : 'dim'}" style="left:${s.x}%;top:${s.y}%"
      data-store="${s.id}" aria-label="${esc(s.name)}">
      <span class="dot" style="background:${shade}"><b>${h.toFixed(1)}</b></span>
      <span class="label">${esc(s.name)}</span>
    </button>`;
  }).join('');
}

function renderMapSide(storeId) {
  const side = document.getElementById('map-side');
  if (!storeId) {
    side.innerHTML = '<p class="muted">Tap a pin to see what that store has on the floor.</p>';
    return;
  }
  const s = storeById(storeId);
  const items = ITEMS.filter((i) => i.storeId === storeId).sort((a, b) => b.heat - a.heat);
  side.innerHTML = `<h3>${esc(s.name)}</h3>
    <p class="meta">${esc(s.hood)} · ${esc(s.address)}</p>
    <p style="margin:.5rem 0">${stars(liveHeat(s.id))} <span class="meta">${s.reviews} ratings</span></p>
    ${items.map((i) => `<div class="mini-item"><span>${esc(i.brand)} — ${esc(i.name)}</span>
      <strong>${money(i.price)}</strong></div>`).join('')}
    <p style="margin-top:1rem"><button class="btn-ghost" data-store="${s.id}">Full store profile</button></p>`;
}

function openSheet(storeId) {
  const s = storeById(storeId);
  const items = ITEMS.filter((i) => i.storeId === storeId).sort((a, b) => b.heat - a.heat);
  const sheet = document.getElementById('sheet');
  sheet.innerHTML = `<button class="close" id="sheet-close" aria-label="Close">×</button>
    <p class="brand">${esc(s.hood)}</p>
    <h2>${esc(s.name)}</h2>
    <p class="meta">${esc(s.address)} · ${s.distanceMi} mi · ${isOpen(s) ? 'open now' : 'closed'}</p>
    <p style="margin-top:.6rem">${stars(liveHeat(s.id))} <span class="meta">${s.reviews} ratings · inventory checked ${daysSince(s.verified)}d ago</span></p>
    <section><h4>How it rates</h4><div class="rating-bars">
      ${bar('Heat on floor', s.stock)}${bar('Pays sellers', s.payout)}${bar('Fair pricing', s.pricing)}
    </div></section>
    <section><h4>Known for</h4><div class="badges">
      ${s.brands.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}
    </div></section>
    <section><h4>On the floor (${items.length})</h4>
      ${items.map((i) => {
        const p = dealPct(i);
        return `<div class="mini-item">
          <span>${stars(i.heat)}<br><span class="meta">${esc(i.brand)} — ${esc(i.name)} · ${esc(i.size)}</span></span>
          <span style="text-align:right"><strong>${money(i.price)}</strong><br>
          <span class="deal ${p >= 0 ? 'under' : 'over'}">${p >= 0 ? p + '% under' : Math.abs(p) + '% over'}</span></span>
        </div>`;
      }).join('')}
    </section>`;
  sheet.hidden = false;
  document.getElementById('backdrop').hidden = false;
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
}

function closeSheet() {
  document.getElementById('sheet').hidden = true;
  document.getElementById('backdrop').hidden = true;
}

function render() {
  const items = visibleItems();
  const stores = visibleStores();

  document.getElementById('items-grid').innerHTML = items.map(itemCard).join('');
  document.getElementById('stores-grid').innerHTML = stores.map(storeCard).join('');

  const savedItems = ITEMS.filter((i) => saved.ids.has(i.id));
  document.getElementById('saved-grid').innerHTML = savedItems.length
    ? savedItems.map(itemCard).join('')
    : '<p class="empty">Nothing saved yet. Tap ☆ on a piece to watch it.</p>';

  document.getElementById('count-items').textContent = items.length;
  document.getElementById('count-stores').textContent = stores.length;
  document.getElementById('count-saved').textContent = savedItems.length;

  const avg = items.length ? items.reduce((a, i) => a + i.heat, 0) / items.length : 0;
  const best = items.length ? Math.max(...items.map(dealPct)) : 0;
  document.getElementById('stats').innerHTML = `
    <div><dt>Pieces tracked</dt><dd>${items.length}</dd></div>
    <div><dt>Avg heat</dt><dd>${avg.toFixed(1)}★</dd></div>
    <div><dt>Best deal</dt><dd>${best}%</dd></div>`;

  renderPins();
  document.getElementById('empty').hidden = !(state.view === 'items' && items.length === 0);
}

/* ---------- wiring ------------------------------------------------------ */

// brand chips, built from whatever is in the data
const brands = [...new Set(ITEMS.map((i) => i.brand))].sort();
document.getElementById('brand-chips').innerHTML =
  brands.map((b) => `<button class="chip" data-brand="${esc(b)}">${esc(b)}</button>`).join('');

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
bind('f-cat', 'cat');
bind('f-heat', 'heat', Number);
bind('f-price', 'price', Number);
bind('f-sort', 'sort');
bind('f-open', 'openOnly');

document.getElementById('reset').addEventListener('click', () => {
  Object.assign(state, { q: '', brands: new Set(), cat: '', heat: 0, price: 0, sort: 'heat', openOnly: false });
  document.getElementById('search').value = '';
  ['f-cat', 'f-heat', 'f-price', 'f-sort'].forEach((id, n) => {
    document.getElementById(id).value = n === 3 ? 'heat' : n === 0 ? '' : '0';
  });
  document.getElementById('f-open').checked = false;
  document.querySelectorAll('.chip.on').forEach((c) => c.classList.remove('on'));
  render();
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    state.view = tab.dataset.view;
    ['items', 'stores', 'map', 'saved'].forEach((v) => {
      document.getElementById('view-' + v).hidden = v !== state.view;
    });
    document.getElementById('filters').hidden = state.view === 'saved';
    render();
  });
});

// one delegated handler for every store link, pin and save star
document.addEventListener('click', (e) => {
  const pin = e.target.closest('.pin');
  if (pin) { renderMapSide(pin.dataset.store); return; }

  const link = e.target.closest('[data-store]');
  if (link) { openSheet(link.dataset.store); return; }

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

render();
