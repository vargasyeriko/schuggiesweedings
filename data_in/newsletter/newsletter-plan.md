# Newsletter Feature Plan – Schuggies-Ceilidhs

> Status: **specified, not built.** Deferred until the client confirms a
> provider. Nothing in the site references a newsletter yet.

## 1. Purpose

A simple, compliant newsletter signup for `schuggies.caitryapps.com` that:

- Collects email addresses for ceilidh updates and planning tips.
- Stores them in a proper email provider (never in this repo).
- Keeps UX and branding consistent with the rest of the site.

## 2. Provider

**Status:** TO CHOOSE (Mailchimp / ConvertKit / Brevo / MailerLite).

Requirements:

- Hosted list, UK GDPR compliant.
- Double opt-in support.
- Simple embeddable HTML form (no JS SDK required — the site has no build step).
- Basic automations (welcome email, occasional broadcasts).

Once chosen, record here:

- Provider: `TBC`
- Account owner: `Schuggies-Ceilidhs`
- Main list / audience name: `Schuggies Ceilidh Newsletter`
- From-name: `Schuggie`
- From-email: `info@schuggies-ceilidhs.co.uk`

## 3. Where the form appears

**Primary:** footer on all pages (injected once via `buildFooter()` in
`assets/js/main.js`, so it lands on all 79 pages automatically).

**Secondary (optional):**

- Bottom of `pages/guides.html` (Wedding Toolkit).
- Bottom of `pages/public-ceilidhs.html` (club night dates).

## 4. Form UX specification

Fields:

- `email` — required, `type="email"`.
- `first_name` — optional, only if the provider supports it.

Copy:

- Title: **Subscribe to updates**
- Subcopy: *Monthly ceilidh dates, planning tips and free resources. No spam, ever.*
- Button: **Subscribe**

Validation:

- Blank / invalid → `Please enter a valid email address.`
- Success → `Thanks — please check your inbox to confirm your subscription.`
- Already subscribed → provider default is acceptable.

Consent note under the button:

> By subscribing you agree to receive occasional emails about ceilidh events
> and planning tips. You can unsubscribe at any time. See our
> [Privacy Policy](/pages/privacy.html) for details.

## 5. Technical integration

The site is static HTML/CSS/JS with **no build step**. We do not build a
backend; the provider's own endpoint receives the POST.

1. Provider generates a `<form>` with `action="https://provider…/subscribe"`
   plus any hidden fields. Save that raw markup to `embed-snippet.html`
   in this folder before adapting it.
2. Paste the adapted form into `buildFooter()` in `assets/js/main.js`:

```html
<form class="nl-form" action="PROVIDER_ACTION_URL" method="post" novalidate>
  <label class="nl-label" for="nl-email">Email address</label>
  <input id="nl-email" name="EMAIL" type="email" required
         autocomplete="email" placeholder="Enter your email">
  <button class="btn btn--chat btn--block" type="submit">Subscribe</button>
  <p class="nl-note">Monthly ceilidh updates &amp; planning tips. Unsubscribe anytime.</p>
</form>
```

3. Add styles to `assets/css/styles.css` — **using design tokens**, not raw
   values:

```css
.nl-form { display: grid; gap: .6rem; max-width: 280px; }
.nl-label { font-size: .85rem; font-weight: 600; color: #fff; }
.nl-form input[type="email"] {
  width: 100%; padding: .7rem .9rem;
  border-radius: var(--radius-sm);          /* NOT 4px — see note below */
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.06); color: #fff;
  min-height: 44px;                          /* touch target */
}
.nl-form input::placeholder { color: rgba(255,255,255,.55); }
.nl-note { font-size: .78rem; color: #cfc7c5; margin: 0; }
@media (max-width: 720px) { .nl-form { max-width: none; } }
```

4. No subscriber data is ever stored in this repo.

### Deviations from the original spec, and why

- **`border-radius: var(--radius-sm)`, not `4px`.** The site runs on two card
  radii plus a small-control radius. A one-off `4px` is exactly the kind of
  drift that made the design read as templated before it was cleaned up.
- **`background: rgba(255,255,255,.06)`, not `#111`.** The footer is
  `var(--ink)`; a hard `#111` is a second near-black that will not match.
- **`.btn--chat` (ceilidh green), not `.btn--primary`.** Green is the
  established "do the thing" colour across the site.
- **`min-height: 44px`** on the input — every interactive element on the site
  clears 44px on touch, and this is verified in the mobile pass.

## 6. Pages affected

- `assets/js/main.js` → `buildFooter()` gains a newsletter column.
- `assets/css/styles.css` → new `.nl-*` block.
- `pages/guides.html`, `pages/public-ceilidhs.html` → optional inline CTA.

## 7. Welcome email & automations

Minimum:

- Welcome email on confirmed signup — thanks, links to Wedding Toolkit and
  FAQs, gentle CTA to *Check Availability* / *Book a Chat*.

Later, optional 3-email sequence:

1. Welcome + toolkit.
2. "What to expect at your first ceilidh."
3. "How a ceilidh first dance works" + link to the Weddings page.

## 8. Test plan

See `test-cases.md` in this folder.

## 9. Maintenance notes

- Broadcasts are sent from the provider UI, not from this repo.
- If the provider changes, update the embed in `buildFooter()`, the saved
  `embed-snippet.html`, and this document.
- Any additional signup spots must reuse the same provider and list.

## 10. Open questions for the client

1. Which provider, and who owns the account?
2. Is there an existing subscriber list to import? (The old WordPress site had
   a "Join my mailing list" link — check where those went.)
3. Sending frequency — the copy promises *monthly*. Is that realistic?
