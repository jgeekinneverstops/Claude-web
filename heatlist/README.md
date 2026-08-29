# HEATLIST — Miami

A finder for Miami's resale floor, from streetwear to hard luxury: **which store
has it today, how fast that piece moves in this city, and who's asking the
least for it.**

Miami is the launch market and the only city with data. `CITY` in `js/data.js`
is the single place the market is defined — neighborhoods, map, filters and
copy all read from it.

Static HTML/CSS/JS — no build step, no dependencies. Open `index.html`, or:

```bash
python3 -m http.server 8000   # from the repo root
# → http://localhost:8000/heatlist/
```

## What it covers

Twelve stores from Aventura down to Coral Gables, and nine categories — tops,
outerwear, denim, footwear, **bags, jewelry, watches, eyewear**, accessories.
Chrome Hearts and Corteiz sit in the same index as Louis Vuitton, Cartier,
Valley and Rolex, because in Miami they sit on the same blocks and often in the
same store.

| View | What it answers |
|---|---|
| **On the floor** | Every listing in the city, filtered by brand, neighborhood, category, heat, price |
| **What's selling** | Every model ranked by units sold and days-to-clear, with the price spread across stores |
| **Stores** | Three ratings per store, two of them computed |
| **Map** | Pins shaded by live floor heat; hover or select for the name |
| **Saved** | Watchlist in `localStorage` — the stand-in for push alerts |

## Rankings come from what sells

Nobody types a star rating in. Heat is derived in `heatOf()` from two measured
facts about the Miami market:

- `sold30` — units of that model sold across tracked stores in 30 days
- `days` — median days one piece sits before it clears

They're blended, not averaged, at 60/40. Volume without speed is a slow mover
that happens to be common; speed without volume is a one-off. A piece is hot
only when it does both — the Neverfull tops the list because it does 34 units
in 30 days *and* clears in three.

This also means a rating decays on its own. A store that sold its good stock
and replaced it with nothing drops down the map by tomorrow, with nobody
editing anything.

## "Who has the best prices" is computed too

Listings are normalized against canonical **models**, so the same Neverfull at
four stores is directly comparable. From that:

- **Best price in Miami** — badge on the cheapest listing of any model
- **Price spread** — how much more the dearest store asks than the cheapest
  (30% on the Neverfull in the demo data)
- **Store price rating** — `priceIndex()` takes the median of
  `store price ÷ city median` across every model that store shares with a
  rival, so a shop is measured only against stores selling the same thing.
  Single-source pieces are excluded; they can't tell you anything.

Only **"pays sellers"** is a reported number rather than a computed one. It
can't be derived from listings — it's what they hand *you* when you walk in to
sell — and it's the number resellers care about most.

## Data

`js/data.js` is **fictional demo data** — invented store names, invented sales
figures, invented prices. Nothing in it describes a real business, and the
banner on the page says so. Do not ship it as-is.

Three tables, and the split is deliberate:

```
CITY    the market. One for now.
MODELS  the canonical piece ("LV Neverfull MM") + how it sells in this city
STOCK   one listing: this model, in this store, at this price
```

Heat belongs to the model (a fact about city-wide demand), price belongs to the
listing (a fact about one store). That separation is what lets the app answer
"what's moving in Miami" and "who has it cheapest" from the same rows.

All three are JSDoc-typed. Replace them with `fetch()` calls and nothing else
changes.

The field that decides whether this lives or dies is `Store.verified` — when
inventory was last confirmed. Every store card surfaces it ("Checked today" /
"Checked 6d ago") because a locator with stale stock is worse than no locator.

## Next, in order

1. Real data for the 12–15 Miami stores (see `BUSINESS.md`).
2. Real map tiles — MapLibre + OpenStreetMap; `Store.x/y` become `lat/lng`.
3. Push alerts on saved models and brands — the retention loop.
4. Store-facing upload, so shops post their own stock with your verification on top.
5. Only then, city #2.
