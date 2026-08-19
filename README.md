# Schuggies-Ceilidhs — Website Clone

A mobile-first static clone/reconstruction of [schuggies-ceilidhs.co.uk](https://schuggies-ceilidhs.co.uk/).
Plain HTML + CSS + JS. No build step. Deploy anywhere (Netlify, Vercel, GitHub Pages, any static host).

## Folder structure

```
website/
├── index.html              # Home
├── pages/
│   ├── weddings.html
│   ├── parties.html
│   ├── corporate.html
│   ├── prices.html         # Prices, packages & options
│   ├── about.html          # Meet Schuggie
│   ├── faqs.html           # Accordion FAQs
│   ├── contact.html        # Contact form + details
│   ├── privacy.html        # ⚠️ placeholder legal text
│   └── terms.html          # ⚠️ placeholder legal text
├── assets/
│   ├── css/styles.css      # Full design system (brand tokens at top)
│   ├── js/main.js          # Header/footer/nav/WhatsApp injected here; SITE config at top
│   ├── images/             # Drop real photos here
│   └── fonts/
└── README.md
```

## Run locally

```bash
cd website
python3 -m http.server 8177
# open http://localhost:8177
```

## Design tokens (pulled from the live site)

| Token            | Value      | Use                         |
|------------------|------------|-----------------------------|
| `--burgundy`     | `#a0263b`  | Primary accent, buttons     |
| `--burgundy-dark`| `#702331`  | Top bar, hover              |
| `--ink`          | `#141414`  | Text, hero, footer          |
| `--sage`         | `#c0d5d0`  | Secondary buttons, sections |
| `--yellow`       | `#fef366`  | Highlight badges            |
| `--purple`       | `#a886cd`  | Accent                      |
| Headings font    | Montserrat | via Google Fonts            |
| Body font        | Hind       | via Google Fonts            |

## Where to customise

- **Contact details, social links, Calendly & WhatsApp URLs** → top of `assets/js/main.js` (`SITE` object). Change once, updates every page.
- **Nav items** → `NAV` array in `assets/js/main.js`.
- **Colours / fonts / spacing** → `:root` variables at the top of `assets/css/styles.css`.
- **Real photos** → replace the `.placeholder-img` blocks with `<img>` tags pointing at `assets/images/…`. Each placeholder's caption says which photo goes there.

## Changing images

All images live in `assets/images/`. Nothing is fetched from WordPress or any CDN —
if a file is not in that folder, it does not appear on the site.

### Where each page's hero is set

There is no central image config. Each page holds its own hero in its own HTML:

| Page | Hero file |
|------|-----------|
| `index.html` | `hero-ceilidh-chandelier-wide-1800.jpg` (+ square, + webp) |
| `pages/weddings.html` | `hero-weddings-1600.jpg` |
| `pages/parties.html` | `hero-parties-1600.jpg` |
| `pages/corporate.html` | `corporate-marquee.webp` |
| `pages/about.html` | `schuggie-quaich.webp` |
| `pages/public-ceilidhs.html` | `public-ceilidh-hall.webp` |

The **logo** is the exception — it is in `assets/js/main.js` (`buildHeader` and
`buildFooter`), so changing it there updates the header and footer on all 79 pages
at once.

### Swapping one hero

1. Put the new photo in `assets/images/`.
2. In that page, find the `<div class="hero__media">` block and point the
   `<picture>` sources and the `<img src>` at the new filenames.
3. Update the `alt` text. It describes the photo to screen readers and to Google —
   a stale `alt` is worse than none.
4. **Bump the `?b=` number** (see below) or nobody sees the change.

### Sizes to generate

Each hero wants a square for phones and a wide version for everything else,
in WebP with a JPG fallback. From a square source:

```
square   1080x1080   .webp + .jpg      phones (max-width: 700px)
wide     1800x900    .webp + .jpg      desktop
wide     2560x1280   .webp             retina desktop
```

Do not generate above ~1.5x the source's real pixels. Blowing a 1080px photo up
to 2400 adds bytes and no detail.

### The `?b=` cache-buster — the step people forget

Every page links `styles.css?b=NN` and `main.js?b=NN`. Cloudflare caches assets for
four hours, so **after any change to CSS, JS or an image, bump that number across
every page** or the old version keeps being served:

```bash
# from the site root — replace 40 with the current number, 41 with the next
grep -rlE '(styles\.css|main\.js)\?b=40' index.html pages/ \
  | xargs sed -i '' -E 's/(styles\.css|main\.js)\?b=40/\1?b=41/g'
```

Images referenced by a *new filename* do not need this — a new name is already a
new URL. It matters when you overwrite a file that keeps its name.

### Deploying

Railway auto-deploys from GitHub `main`. `git push` and it is live in about 30
seconds. There is no build step.

## TODO before going live

- [ ] Swap placeholder image blocks for real photos (logo, hero, gallery, Schuggie portrait).
- [ ] Update the WhatsApp number in `SITE.whatsapp` (currently a guess based on the landline).
- [ ] Wire the contact form to a real endpoint (Formspree / Netlify Forms / email service). Currently front-end demo only.
- [ ] Replace placeholder Privacy & Terms with reviewed legal text.
- [ ] Add real testimonials (current ones are representative placeholders).
- [ ] Add favicon + OG share image.

## Notes

- Header, footer, mobile drawer and WhatsApp float are injected by JS into `#site-header-mount` / `#site-footer-mount` so there's a single source of truth — no duplicated markup across pages.
- Fully responsive & mobile-first: hamburger drawer < 1000px, everything stacks on phones, `env(safe-area-inset)` respected for notched devices.
- Accessible: semantic landmarks, `aria-current`, focus states, `prefers-reduced-motion` respected.
