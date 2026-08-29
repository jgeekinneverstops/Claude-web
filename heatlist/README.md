# HEATLIST

A store finder for the resale side of streetwear: **which shop near me has heat
on the floor right now, what are they asking, and is that a fair number.**

Static HTML/CSS/JS — no build step, no dependencies. Open `index.html`, or:

```bash
python3 -m http.server 8000   # from the repo root
# → http://localhost:8000/heatlist/
```

## What the prototype does

| | |
|---|---|
| **Heat feed** | Every tracked piece, sorted by demand, deal, freshness, distance or price |
| **Deal score** | Asking price vs. recent market comp, shown as *% under / over comp* |
| **Store cards** | Three separate 1–5 ratings, because "good store" means different things |
| **Map** | Pins shaded by live floor heat; tap for that store's inventory |
| **Saved** | Watchlist in `localStorage` — the stand-in for push alerts |
| **Filters** | Brand chips, category, min heat, max price, open-now, free-text search |

## The three ratings (this is the actual product idea)

One star rating is useless here, because a store is good or bad at three
unrelated things:

- **Heat on floor** — how much of what people want is physically in there today.
- **Pays sellers** — what they hand you when *you* walk in to sell. This is the
  number resellers care about and nobody publishes.
- **Fair pricing** — are they at, under, or over market when you buy.

A tourist shop can be 5★ on heat and 2★ on payout. Collapsing that into one
number throws away the only information worth opening an app for.

Floor heat is *computed*, not typed in: `liveHeat()` in `js/app.js` averages a
store's three hottest pieces, so the rating decays on its own when good stock
sells and nothing replaces it. A store cannot coast on an old reputation.

## Data

`js/data.js` is **fictional demo data** — invented store names, invented
ratings, invented prices. Nothing in it describes a real business, and the
banner at the top of the page says so. Do not ship it as-is.

The shapes in that file are the real contract though. Both `STORES` and `ITEMS`
are JSDoc-typed; replace the two arrays with `fetch()` calls against your own
API and nothing else in `app.js` changes.

The one field that decides whether this product lives or dies is
`Store.verified` — when inventory was last confirmed. The UI surfaces it on
every store card ("Checked today" / "Checked 6d ago") because a locator with
stale stock is worse than no locator.

## Next, in order

1. Replace demo data with a real feed (see `BUSINESS.md` — start with one
   neighborhood, walked by hand).
2. Real map tiles. Swap the stylized SVG for MapLibre + a free tile source;
   `Store.x/y` become `lat/lng`.
3. Push alerts on saved brands — the retention loop.
4. Store-facing upload so shops post their own stock, with your verification
   pass on top.
