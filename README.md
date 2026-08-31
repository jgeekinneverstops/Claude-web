# Claude-web

A clean, modern personal website — no frameworks, no build step. Just open it.

## Preview locally

```bash
# From the repo root, either open index.html directly in a browser, or:
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Features

- Responsive layout (mobile hamburger menu included)
- Light/dark theme toggle, remembered between visits
- Smooth scrolling with active-section highlighting in the nav
- Reveal-on-scroll animations (respects reduced-motion preference)
- Sections: Hero, About, Projects, Contact

## Challenge tracker (`challenge.html`)

A trade journal for a $500 → $10,000 crypto challenge. It records the
catalyst behind every entry — a tweet, a callout, an official announcement —
and then tells you whether that catalyst actually made money.

**It is a journal. It has no exchange connection, no API keys, and it places
no orders.** Nothing on the page is financial advice.

What it tracks:

- **Equity and progress**, on a log scale — $500 → $1,000 is the same amount
  of work as $5,000 → $10,000, and a linear bar hides that
- **R-multiples** — every result measured against the risk taken, so a trade
  stopped out is `-1R` whatever the asset or size
- **Expectancy by catalyst type** — the table that answers "are these calls
  actually good?", and which stays silent until a source has ~20 trades
  behind it, because below that you are reading noise
- **A position sizer** that warns when a trade breaks your risk-per-trade
  limit, and shows how many consecutive losses would halve the account
- **Trades still needed** to reach the goal, computed from your own logged
  expectancy — usually a far bigger number than expected, which is the point
- Max drawdown, open risk, and a per-trade thesis you write *before* entry

Data lives in the browser's `localStorage` only. Export to JSON or CSV
regularly — clearing site data deletes the log.

## Customizing

- **Your name & text** — edit the content in `index.html`
- **Colors** — change the CSS variables at the top of `css/style.css`
  (`--accent` sets the theme color)
- **Projects** — duplicate a `.project-card` block in `index.html` to add more
- **Photo** — replace the `.about-avatar` initials block with an `<img>`

## Deploying

This is a static site, so it works anywhere: GitHub Pages, Netlify, Vercel,
Cloudflare Pages, etc. For GitHub Pages: repository **Settings → Pages →**
deploy from the branch containing these files.
