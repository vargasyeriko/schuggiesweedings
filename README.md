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
