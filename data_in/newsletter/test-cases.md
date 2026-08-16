# Newsletter Test Cases

Run all of these before telling the client it is live.

## Local (`python3 tryon.py`, http://localhost:8177)

| # | Case | Expected |
|---|------|----------|
| 1 | Submit empty field | Browser blocks; `Please enter a valid email address.` |
| 2 | Submit `notanemail` | Same validation message, no network request |
| 3 | Submit `test+ceilidh@example.com` | POSTs to provider, no console errors |
| 4 | Form at 390px wide | Full width, input ≥44px tall, no horizontal scroll |
| 5 | Form at 1440px | Constrained to its footer column, aligned with others |
| 6 | Keyboard only | Tab reaches input and button; focus ring visible |
| 7 | Screen reader | Label announced (not just placeholder) |
| 8 | Footer floats | WhatsApp/chat bubbles do not cover the form or button |

## Live (`https://schuggies.caitryapps.com`)

| # | Case | Expected |
|---|------|----------|
| 9  | Subscribe with a real test address | Double opt-in email arrives |
| 10 | Click confirm link | Lands on provider confirmation page |
| 11 | Check provider dashboard | Contact present, with consent timestamp + source |
| 12 | Welcome email | Arrives, links work, unsubscribe link present |
| 13 | Unsubscribe | Removes/marks the contact correctly |
| 14 | Resubscribe same address | Handled gracefully, no ugly error page |
| 15 | Check spam folder | Mail lands in inbox, not spam (SPF/DKIM configured) |

## Regression — the form is in the shared footer, so it touches every page

| # | Case | Expected |
|---|------|----------|
| 16 | Spot-check index, a `/pages/` page, and a `/pages/blog/` post | Form renders identically at all three directory depths |
| 17 | Hit-test the footer | No element is covered — see the `elementFromPoint` sweep that caught the chatbot overlay bug |
| 18 | `?b=` bumped | Bump the cache version or Cloudflare serves the old footer for 4h |
