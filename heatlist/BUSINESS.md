# Turning Heatlist into a business

Notes on the hard part. The app is a weekend; the business is the data.

---

## 1. The only real problem: cold start and decay

Nobody opens a store locator that is wrong. Resale inventory turns in days —
one piece, one size, sold and gone. So you are not building a directory, you
are building a **freshness machine**, and every hard decision follows from
that.

Three ways to fill it, in the order you should actually try them:

**a) Walk it yourself (weeks 1–8).** One neighborhood. Wynwood, say. Visit the
shops on a fixed loop twice a week, photograph the floor, log it. It does not
scale — that is the point. It is the only way to learn what a store owner will
and won't tell you, and 8 stores × 30 pieces is already a more accurate map of
that neighborhood than anything that exists.

**b) Get the stores to post (months 2–6).** A shop that just took in a grail
*wants* buyers to know within the hour. Give them a 30-second phone upload:
photo, brand, size, price, done. They already do this on Instagram Stories,
badly, where it vanishes in 24 hours and isn't searchable. You are not asking
for new work, you are giving their existing work a longer shelf life. Import
their IG feed for them at first so their page isn't empty on day one.

**c) Let users check in (month 6+).** "Saw it, still there / it's gone." One
tap. Only works once you already have traffic — do not start here.

Freshness has to be visible or the whole thing rots quietly. Every store shows
when it was last verified; anything unconfirmed for a week should visibly fade.
Be honest about staleness and people trust the fresh entries. Hide it and one
wasted drive across town loses that user forever.

## 2. Who pays

Consumers won't, not at first. Four candidates, ranked by how soon they work:

| Revenue line | Who pays | When | Reality check |
|---|---|---|---|
| **Featured placement** | Stores | Month 3 | $150–400/mo for top-of-feed in their city. Easiest sale — it's Instagram-ad money they already spend, and you can show them exact click counts. |
| **Seller-lead routing** | Stores | Month 6 | The real one. See below. |
| **Pro tier** | Resellers | Month 6 | $15–25/mo: instant alerts, payout comparison, sold-price history. The people who make money from the info will pay for it. |
| **Affiliate / consignment cut** | Stores | Year 2 | Only once you can prove attribution. Hard; don't build for it early. |

**Seller-lead routing is the actual business.** Your app knows which store pays
best for Chrome Hearts. Someone with a piece to sell tells you what they have;
you route them to the two shops that want it most; the shop that closes pays
you a flat fee ($10–40) or a small percentage. Stores fight over good inbound
inventory far harder than over customers — inventory is the scarce thing. Sell
them supply, not attention. That is also why "Pays sellers" is a first-class
rating in the app rather than a footnote.

## 3. The wedge

Do not launch "the app for resale stores in America." Launch **Miami
streetwear, 15 stores, one map**. Small enough to keep accurate by hand, big
enough that being right is genuinely useful. A directory that is 100% accurate
in one neighborhood beats one that's 40% accurate nationally, every time.

Expansion order: Miami → one more dense city with a real scene (LA, NY,
Atlanta, Toronto) → then let the playbook repeat. Each city needs its own
walked cold start. There is no shortcut, and that difficulty is your moat:
the sold-price and payout history you accumulate per store cannot be scraped
by whoever copies your UI.

## 4. What it costs to find out

The prototype in this folder is free to host — GitHub Pages, Netlify, Cloudflare
Pages, all $0 at this scale. Beyond that, before you commit real money:

- Backend + database: $0–20/mo (Supabase or Firebase free tier covers the first
  thousands of users).
- Map tiles: free up to a real user base (MapLibre + OpenStreetMap).
- Domain: ~$15/yr.
- Your time walking stores: the whole actual cost.

So the honest budget for a 90-day test is under $100 plus legwork. Do not
incorporate, do not hire, do not pay for a designer, do not build native iOS
until the web app has people opening it twice a week. Ship it as a web app that
installs to the home screen (PWA) — same icon on the phone, no app-store review
holding up your fixes.

## 5. The legal and relationship stuff, briefly

- **Ratings of real businesses.** Opinion and honestly-reported user experience
  are protected; inventing a rating for a real store is not, and it will also
  end your relationship with the only people who can supply your data. Never
  seed a real store with a made-up number — that is exactly why the demo data
  in this repo uses invented names.
- **Photos.** Use the store's own images with permission, or your own. Don't
  scrape and republish.
- **Counterfeits.** The moment you list an item you are adjacent to
  authentication. Say plainly that you don't authenticate and don't sell —
  you point at stores. Never take custody, never take payment for goods.
  A listing platform inherits a liability that a locator doesn't; stay a
  locator as long as you can.
- **Store relationships beat everything.** Fifteen owners who take your call are
  worth more than any feature. Walk in, buy something, be a customer before
  you're a founder.

## 6. First 90 days

| Weeks | Do this | Kill criteria |
|---|---|---|
| 1–2 | Walk 15 Miami stores. Log inventory by hand into `js/data.js`. Ask each owner: "would you post your new stock here?" | Fewer than 5 owners say yes → the supply side doesn't want it |
| 3–4 | Ship the web app with the real 15. Post it in Miami streetwear Discords, Reddit, IG. | Under 200 visits in two weeks → the demand side doesn't want it |
| 5–8 | Keep it current twice a week, by hand. Add saved-brand alerts. | Under 15% of visitors come back within 7 days → no retention, no business |
| 9–12 | Sell featured placement to 3 stores. Run 10 seller-leads manually — over text if you have to, no code. | Nobody pays for either → the revenue thesis is wrong, not the product |

Every one of those weeks is designed to produce a *no* cheaply. That's the
point. The product question ("can I build it") is settled — this folder is the
answer. The open questions are whether stores will feed it and whether anyone
pays, and neither gets answered by writing more code.
