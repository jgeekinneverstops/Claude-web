# Paycheck to Portfolio

One dial. Open `money/paycheck.html` in a browser — no build step, no
dependencies, no network calls except Google Fonts.

## What it does

Takes an hourly wage and monthly bills, works out the surplus, and shows what
that surplus becomes if it is invested rather than left in checking.

- **Income streams** — four ways to add income (overtime, resale, contract
  work, portfolio dividends), each showing net per month, effective hourly
  rate, hours cost, and what it compounds to if invested
- **Flow bar** — where total take-home goes: bills, invested, spare
- **The dial** — one slider for the monthly contribution, bounded by the
  surplus so it can't be set to something unaffordable
- **Projection** — a stacked area chart splitting the account into money
  contributed and market growth, so the crossover point is visible
- **Funding order** — cash cushion, Roth IRA, taxable brokerage, with live
  dollar amounts per bucket

## Editing the defaults

Starting figures live in the `value` attributes of the inputs in
`paycheck.html`. Entered values persist to `localStorage` under `p2p.v1` —
per browser, per device, never transmitted.

Stream assumptions are constants at the top of the script: `ROTH_LIMIT`,
`OT_MULT` (overtime multiplier), `CT_MULT` (contract rate vs employed rate),
`HRS_PER_ITEM` and `INV_PER_ITEM` for resale, and `SE_SURCHARGE` — the points
of self-employment tax that W-2 overtime avoids. The IRS adjusts the Roth
limit for inflation; confirm the current year's figure.

## Assumptions

The default 7%/year is a long-run historical real return for a broad US index
fund, so projected figures are in today's buying power.

The day job is entered as take-home, so no tax modelling applies to it. The
tax field covers self-employed streams only (resale, contract work) as a flat
set-aside; overtime is W-2 wages and is taxed `SE_SURCHARGE` points lower,
since the employer still pays half of Social Security.

A planning tool, not financial advice.

---

# The Paper Trade Journal

`money/journal.html` — a teaching page for keeping a trading journal by hand.
No JavaScript; it is a document, not a tool.

## What it covers

- **Process vs. outcome** — the 2×2 that separates skill from luck, and why
  "broke the plan and got paid" is the most expensive quadrant
- **Page 1 rules card** — risk per trade, daily stop, trade cap, signed and
  dated before the first entry
- **The trade sheet** — blank template beside a filled worked example, split
  into fields written *before* entry and fields written *after* exit
- **The weekly review sheet**
- **The arithmetic** — R multiples, expectancy, and what a real edge implies
  about how long a 10× actually takes at each position size

## Print

`@media print` hides the prose and emits the three fillable sheets, one per
page, black on white. Sections marked `.no-print` are teaching material;
`.print-sheet` sections are the forms.

## A note on the numbers

The example trade and the two sample books are worked examples chosen to
demonstrate the arithmetic — including one book that wins 55% of its trades
and still loses money. They are not predictions or a strategy to copy.
