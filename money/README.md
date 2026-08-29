# Paycheck to Portfolio

One dial. Open `money/paycheck.html` in a browser — no build step, no
dependencies, no network calls except Google Fonts.

## What it does

Takes an hourly wage and monthly bills, works out the surplus, and shows what
that surplus becomes if it is invested rather than left in checking.

- **Flow bar** — where each month's gross pay actually goes: taxes, bills,
  invested, spare
- **The dial** — one slider for the monthly contribution, bounded by the
  surplus so it can't be set to something unaffordable
- **Projection** — a stacked area chart splitting the account into money
  contributed and market growth, so the crossover point is visible
- **Funding order** — 401(k) match, cash cushion, Roth IRA, taxable
  brokerage, with live dollar amounts per bucket

## Editing the defaults

Starting figures live in the `value` attributes of the inputs in
`paycheck.html`. Entered values persist to `localStorage` under `p2p.v1` —
per browser, per device, never transmitted.

The Roth IRA annual limit is the constant `ROTH_LIMIT` in the script. The IRS
adjusts it for inflation; confirm the current year's figure.

## Assumptions

The default 7%/year is a long-run historical real return for a broad US index
fund, so projected figures are in today's buying power. The tax field is a
flat effective rate, not a bracket calculation — 20% is a reasonable estimate
for this income in a state with income tax, nearer 16% without.

A planning tool, not financial advice.
