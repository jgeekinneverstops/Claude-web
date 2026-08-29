# Runway to $5K

A single-page planning tool. No build step, no dependencies, no network calls
except Google Fonts — open `runway.html` in a browser.

## What it does

Separates liquid cash from things that only look like assets (credit limits,
a prop-firm evaluation balance, unsold inventory), then solves for the monthly
income needed to reach a savings goal.

Four live calculators:

- **Runway** — liquid ÷ monthly burn, the months-to-zero figure at no income
- **Path to goal** — income slider driving an 18-month balance projection;
  the chart horizon adapts to frame the goal crossing
- **Flip margin** — resale profit after real platform fees (eBay, Grailed,
  StockX, Poshmark, Depop) plus shipping
- **Savings yield** — what a high-yield account actually pays at a given balance

## Editing the defaults

Starting figures live in the `value` attributes of the inputs in
`runway.html`. Change them there and the page recalculates on load.

Entered values persist to `localStorage` under the key `runway5k.v1` — per
browser, per device. Nothing is transmitted anywhere.

## Notes

Platform fee rates are published US rates as of 2026 and change from time to
time; verify before listing. This is a planning tool, not financial advice.
