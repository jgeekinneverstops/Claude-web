# Turning Heatlist into a business

Notes on the hard part. The app is a weekend; the business is the data.

Miami is the whole plan for the first year. Not "starting with Miami" as a
figure of speech — one city, walked by hand, until it is genuinely accurate.

---

## 1. Why Miami is the right first market

It isn't sentiment, it's density and mix. Within roughly ten miles you have
Bal Harbour and Brickell doing Hermès, Cartier and Rolex; the Design District
and Wynwood doing Chrome Hearts and Rick Owens; Little Havana and North Miami
doing sneakers and Corteiz; and South Beach doing tourist-priced everything.
Three things follow from that:

- **A buyer can actually act on the information.** "Cheapest Neverfull is in
  Aventura, 12 minutes away" is a decision. In a sprawling market it's a
  wasted afternoon.
- **The price spread is enormous.** In the demo data the same Neverfull runs
  30% between the cheapest and dearest store, and the same Chrome Hearts hoodie
  37%. Spread is the product. A city where every store prices the same has
  nothing to compare.
- **Stock crosses over.** The same store sells a $185 Hellstar hoodie and a
  $6,000 Cartier bracelet. That is unusual, and it means one app can serve both
  audiences without splitting the index.

Do not launch "the app for resale stores in America." Launch **Miami, 12–15
stores, one map**. Small enough to keep accurate by hand, big enough that being
right is genuinely useful. Expansion (LA, NY, Atlanta, Toronto) waits until
Miami works — each city needs its own walked cold start, and that difficulty is
the moat: the sold-price and payout history you accumulate cannot be scraped by
whoever copies your UI.

## 2. The only real problem: cold start and decay

Nobody opens a store locator that is wrong. Resale inventory turns in days —
one piece, one size, sold and gone. You are not building a directory, you are
building a **freshness machine**, and every hard decision follows from that.

Three ways to fill it, in the order to try them:

**a) Walk it yourself (weeks 1–8).** Wynwood, the Design District, Brickell,
Bal Harbour. A fixed loop, twice a week, photographing floors and logging them.
It does not scale — that is the point. It's the only way to learn what an owner
will and won't tell you, and 12 stores × 30 pieces is already a better map of
Miami resale than anything that exists.

**b) Get the stores to post (months 2–6).** A shop that just took in a Birkin
*wants* buyers to know within the hour. Give them a 30-second phone upload:
photo, model, size, price, done. They already do this on Instagram Stories,
badly, where it vanishes in 24 hours and isn't searchable. You're not asking
for new work, you're giving their existing work a longer shelf life. Import
their IG feed for them at first so their page isn't empty on day one.

**c) Let users check in (month 6+).** "Saw it, still there / it's gone." One
tap. Only works once you have traffic — do not start here.

Freshness has to be visible or the whole thing rots quietly. Every store shows
when it was last verified; anything unconfirmed for a week should visibly fade.
Be honest about staleness and people trust the fresh entries. Hide it and one
wasted drive across town loses that user forever.

## 3. Getting the sell-through data, which is harder

The ranking is built on units sold and days-to-clear, and **no store hands you
that**. Three ways to get it, weakest to strongest:

1. **Disappearance tracking.** You logged it Tuesday, it's gone Friday — that's
   a sale and a days-to-clear number. Free, works from day one, and it is
   exactly why the twice-a-week walking loop matters more than it looks.
2. **Ask, in exchange for something.** Owners will tell you what moved last
   month if you hand them a page showing what the other eleven stores are
   asking for the same models. They cannot get that anywhere else, and it is
   worth more to them than the number they're giving you.
3. **Their POS, eventually.** Once you're worth integrating with. Year two, not
   before.

Method 1 alone is enough to launch, and it degrades honestly: a piece you never
saw sell just never enters the ranking.

## 4. Who pays

Consumers won't, not at first.

| Revenue line | Who pays | When | Reality check |
|---|---|---|---|
| **Featured placement** | Stores | Month 3 | $150–400/mo for top-of-feed. Easiest sale — it's Instagram-ad money they already spend, and you can show exact click counts. |
| **Seller-lead routing** | Stores | Month 6 | The real one. See below. |
| **Pro tier** | Resellers | Month 6 | $15–25/mo: instant alerts, payout comparison, sold-price history. The people who make money from the info will pay for it. |
| **Affiliate / consignment cut** | Stores | Year 2 | Only once you can prove attribution. Hard; don't build for it early. |

**Seller-lead routing is the actual business.** Your app knows which store pays
best for Chrome Hearts and which moves Cartier fastest. Someone with a piece to
sell tells you what they have; you route them to the two shops that want it
most; the shop that closes pays you a flat fee. Stores fight over good inbound
inventory far harder than over customers — inventory is the scarce thing. Sell
them supply, not attention. That's exactly why "pays sellers" is a first-class
rating in the app rather than a footnote.

**Luxury is what makes that fee real.** A streetwear lead is worth maybe $10–40
to a store. A Neverfull, a Love bracelet or a Datejust lead is worth
$100–300 — the store's margin on one is in the hundreds to thousands, and they
will happily pay a few percent of that for inbound supply they didn't have to
chase. Same app, same routing, an order of magnitude more per lead. Streetwear
brings the traffic and the daily habit; luxury pays the bills. Build the index
so both live in it from day one, which is what the category list already does.

## 5. What it costs to find out

The prototype is free to host — GitHub Pages, Netlify, Cloudflare Pages, all $0
at this scale. Beyond that:

- Backend + database: $0–20/mo (Supabase or Firebase free tier covers the first
  thousands of users).
- Map tiles: free up to a real user base (MapLibre + OpenStreetMap).
- Domain: ~$15/yr.
- Your time walking Miami: the whole actual cost.

So the honest budget for a 90-day test is under $100 plus legwork. Do not
incorporate, hire, pay a designer, or build native iOS until the web app has
people opening it twice a week. Ship it as a web app that installs to the home
screen (PWA) — same icon on the phone, no app-store review holding up fixes.

## 6. The legal and relationship stuff, briefly

- **Ratings of real businesses.** Opinion and honestly-reported user experience
  are protected; inventing a rating for a real store is not, and it will end
  your relationship with the only people who can supply your data. Never seed a
  real store with a made-up number — that's why the demo data here uses
  invented names. Note that the two computed ratings dodge this entirely: a
  price index is an arithmetic fact about published asking prices, not an
  opinion, and it's much harder to argue with.
- **Photos.** Use the store's own images with permission, or your own. Don't
  scrape and republish.
- **Counterfeits.** Listing luxury handbags and watches puts you next door to
  authentication, and Miami has a real fake problem in exactly these
  categories. Say plainly that you don't authenticate and don't sell — you
  point at stores. Never take custody, never take payment for goods. A listing
  platform inherits liability a locator doesn't; stay a locator as long as you
  can.
- **Store relationships beat everything.** Fifteen owners who take your call
  are worth more than any feature. Walk in, buy something, be a customer before
  you're a founder.

## 7. First 90 days in Miami

| Weeks | Do this | Kill criteria |
|---|---|---|
| 1–2 | Walk 15 stores across Wynwood, Design District, Brickell, Bal Harbour and North Miami. Log inventory by hand into `js/data.js`. Ask each owner: "would you post your new stock here?" | Fewer than 5 owners say yes → the supply side doesn't want it |
| 3–4 | Ship with the real 15. Post it in Miami streetwear Discords, resale IG, Reddit. Re-walk the loop twice a week and log what disappeared — that's your first sell-through data. | Under 200 visits in two weeks → the demand side doesn't want it |
| 5–8 | Keep it current, by hand. Add saved-model alerts. Show owners their price position vs. the other stores — that's the trade for their sales numbers. | Under 15% of visitors return within 7 days → no retention, no business |
| 9–12 | Sell featured placement to 3 stores. Run 10 seller-leads manually, over text if you have to, no code. Do at least 3 of them in luxury to test the higher fee. | Nobody pays for either → the revenue thesis is wrong, not the product |

Every one of those weeks is designed to produce a *no* cheaply. That's the
point. The product question ("can I build it") is settled — this folder is the
answer. Whether Miami's stores will feed it, and whether anyone pays, is not
answered by writing more code.
