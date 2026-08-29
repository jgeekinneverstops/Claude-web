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

## What's here

- `index.html` + `css/` + `js/` — the personal site
- `heatlist/` — **Heatlist**, a Miami resale store finder covering streetwear
  through hard luxury ([readme](heatlist/README.md) ·
  [business notes](heatlist/BUSINESS.md)). Same no-build approach; open
  `heatlist/index.html`.

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
