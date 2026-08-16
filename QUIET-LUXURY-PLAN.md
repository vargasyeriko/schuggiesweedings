# Quiet-Luxury Plan — Schuggies-Ceilidhs

Implementation record + instructions for continuing the work.

## Read this first: there is no React here

The site is **static HTML + CSS + JS, no build step**. `tryon.py` serves `./`
directly; edits are live on save. There is no `package.json`, no bundler, no
`node_modules`.

The brief was written for React by someone who could not see the source (they
said so). **The design system in it is stack-agnostic and has been implemented
as CSS components carrying the brief's own component names**, so the mapping is
1:1 if this ever becomes a component tree.

| Brief component  | Implemented as     | Where |
|------------------|--------------------|-------|
| `LuxurySection`  | `.luxury-section`  | styles.css, "QUIET-LUXURY LAYER" |
| `SectionLabel`   | `.section-label`   | (existing `.eyebrow` also serves this role) |
| `StatementText`  | `.statement-text`  | used once on Home |
| `ServicePanel`   | `.service-panel`   | Weddings + Parties on Home |
| `FullBleedMedia` | `.full-bleed`      | used once on Home |
| `ImagePair`      | `.image-pair`      | defined, not yet placed |
| `QuoteFeature`   | `.quote-feature`   | Home testimonials |
| `ConciergeCTA`   | `.concierge`       | defined, not yet placed |
| `MediaFrame`     | `.media-frame`     | defined; `.imgframe` already does most of this |
| `SoftReveal`     | `.reveal`          | existing, retimed to `.78s cubic-bezier(.22,1,.36,1)` |
| `MinimalNav`     | `.site-header`     | existing; already transparent→solid on scroll |
| `LuxuryButton`   | `.btn` + variants  | existing; see conflict note below |

### Cost of an actual React migration

Not recommended right now, but for the record: bundler + build step +
deploy pipeline change, `tryon.py` workflow retired, ~1–2 days, and the client
loses "edit a file, refresh, it's live". The visual result would be identical
to what CSS already delivers here.

## Done on the homepage (§ numbers refer to the brief)

- **§1 LuxurySection** — spacing tokens `--sp-xs…--sp-sectionLg`, section
  rhythm `clamp(64px, 9vw, 120px)` / `clamp(80px, 12vw, 160px)`.
- **§7 ServicePanel** — Weddings/Parties cards became tall editorial panels
  (3:4 mobile, 4:5 desktop), gradient base, arrow nudges 4px on hover, image
  scales 1.04 over .9s. **Copy, photos and links unchanged.**
- **§8 StatementText** — used exactly once: "No empty dancefloor. Not for one
  *single* song." Drawn from existing hero copy, not newly invented marketing.
- **§9 FullBleedMedia** — one full-viewport-width image between Services and
  Why-choose-me, for contrast against the controlled grid.
- **§11 SoftReveal** — one motion system: `opacity + translateY(24px)`, .78s,
  `cubic-bezier(.22, 1, .36, 1)`. Already honours `prefers-reduced-motion`.
- **§13 SectionLabel** — `.section-label`, tiny/uppercase/`.26em` tracking.
- **§14 QuoteFeature** — one large featured quote; the other two reviews demoted
  to a quiet two-column rail beneath. **No review was deleted.**
- **§18 Spacing tokens** — global, replacing arbitrary margins.

## Deliberately NOT done, and why

- **§12 LuxuryButton (square/minimal)** — conflicts with the brief's own CORE
  RULE ("preserve existing branding"). The pill button is the established
  brand. Changing it is a branding decision, not a presentation one. Ask first.
- **§2 MinimalNav trimmed to 4–5 items** — conflicts with the earlier signed-off
  brief, which specifies 8 nav items. Cannot satisfy both.
- **§16 InquiryDrawer** — real scope: new UI + wiring the existing contact form
  into a drawer without breaking submission. Worth doing, but it is a feature,
  not a polish pass.
- **§10 ImagePair / §15 ConciergeCTA** — CSS is ready; needs a decision about
  which existing section each replaces.

## Next steps, in priority order

1. **ConciergeCTA** — convert the existing final CTA strip. Pure presentation.
2. **ImagePair** — replace one Weddings or Parties split with the asymmetric pair.
3. **Interior pages** — apply `.luxury-section` rhythm to Weddings/Parties/About.
4. **InquiryDrawer** — only after 1–3, and only with form handling preserved.

## Hard-won gotchas — read before editing styles.css

- **Rule order matters more than specificity here.** `.site-footer`,
  `.wa-float` and `.cbot` are declared late in the file. Overrides written
  earlier are silently ignored. The bottom-edge block is pinned to the end of
  the file with a comment saying why. This has bitten three times.
- **Balanced braces do not mean valid CSS.** A missing `}` on a media query
  swallowed every rule after it into `@media (max-width: 700px)`, so the whole
  quiet-luxury layer worked on phones and silently vanished on desktop, while
  the brace count still balanced (a stray `}` elsewhere cancelled it out).
  Verify with a depth scan, not a count:

  ```
  python3 - <<'PY'
  import re, pathlib
  src = pathlib.Path("assets/css/styles.css").read_text()
  clean = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]',' ',m.group(0)), src, flags=re.S)
  depth = 0
  for ln, line in enumerate(clean.splitlines(), 1):
      for ch in line:
          if ch == '{': depth += 1
          elif ch == '}':
              depth -= 1
              if depth < 0: print("extra } line", ln); depth = 0
  print("final depth:", depth)
  PY
  ```

  Better still, check `document.styleSheets[n].cssRules.length` in the browser —
  if it is lower than expected, parsing died somewhere.
- **Bump `?b=` on every asset edit.** Cloudflare and the browser both cache
  hard. Currently at `?b=23`.
- **Source photos are 1080×1080.** Everything larger is interpolated. Real
  sharpness needs originals from the photographer; the `srcset` is already
  wired to take them as a straight file swap.
