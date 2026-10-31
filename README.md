# Ten Sen Lab — Landing Page

Static, single-page site. No build step, no CDN, no framework. Open `index.html`
directly or serve the folder with any static file server.

## Run it

```
# double-click index.html, or:
npx serve .
# or
python3 -m http.server 8080
```

## Brand asset inspection notes

Source: `~/Desktop/ten sen lab/` (untouched, read-only).

**Fonts**
- `fonts/archimoto/` — 20 static OTF weights (Thin–Black + italics), no web
  formats shipped. Converted the weights actually used (Light, Regular,
  Medium, SemiBold, Bold, Black) to WOFF2 with `fonttools` into
  `assets/fonts/archimoto/`.
- `fonts/switzer/Fonts/WEB/fonts/` — already had a full web kit. Copied
  `Switzer-Variable.woff2/.woff` and `Switzer-VariableItalic.woff2` into
  `assets/fonts/switzer/`.
- Specimen check (rendered live before deciding the type system): Archimoto
  reads best in uppercase at display sizes, Bold (700) for H1/H2, SemiBold
  (600) for H3 and the mission statement. It has almost no lowercase
  descenders worth leaning on, so body copy stays in Switzer throughout —
  Archimoto never appears below ~24px.

**Logo**
- `logo/Ten Sen.svg` — viewBox `0 0 160 160`, fully vectorized paths (no
  `<text>`), no fill attribute set anywhere (defaults to black). I added
  `fill="currentColor"` to the root `<svg>` so it inherits the surrounding
  text color on both light and dark backgrounds. This file reads as a
  compact icon that fuses a small circular mark with the "TEN / SEN / LAB"
  lettering — it does **not** visually match the larger frame+dots+dash
  mark seen in `tSLL-07.png` (see deviation note below). Per the brief it is
  still the primary web logo and is inlined in the header and footer.
- `logo/tSLL-07.png` — full lockup: frame (rectangle, small dot, large dot,
  dash) at left, stacked TEN / SEN / LAB wordmark at right, black on white,
  1556×1556. Used as the source image for the generated OG image and as
  `assets/logo/lockup-black.png` for the JSON-LD `logo` field.
- `logo/tSLL-08.png` — same wordmark reversed (white on black), 1556×1556.
  Kept but unused on this page (monochrome palette already handles light/
  dark via `currentColor`).
- `logo/tsssl.png`, `ttttssslll-08/09/10.png` — pairs of the frame mark with
  the large circle split diagonally or horizontally, 1805×1805. These read
  as exploratory/alternate icon treatments rather than a separate final
  asset; not used on the page.
- `logo/main logo.zip` — 900 bytes, left unopened per instructions (too
  small to likely contain anything not already covered above; flag for the
  brand owner to confirm contents before relying on it for anything else).

**Favicon / OG image** — generated from the real vector mark: `favicon.svg`
is the inlined logo SVG; `favicon-32.png` / `favicon-180.png` were
rasterized from it via macOS QuickLook + `sips` (no network tool fetch, no
placeholder art). `og-image.png` (1200×630) composites `tSLL-07.png` on the
`--paper` background color.

## Folder map

```
index.html              full static markup (works without JS)
css/fonts.css           @font-face only
css/tokens.css          design tokens (color, type scale, spacing, motion)
css/styles.css          layout + components for all 12 sections
js/content.js           editable copy/config (email, form endpoint, socials)
js/main.js              Lenis + GSAP/ScrollTrigger + form + menu + reveal logic
vendor/                 gsap.min.js, ScrollTrigger.min.js, lenis.min.js (local, from npm packs — no CDN)
assets/fonts/            converted Archimoto WOFF2 + copied Switzer variable fonts
assets/logo/             inlined-ready SVG + lockup PNG
assets/img/              favicon.svg/png, og-image.png
robots.txt, sitemap.xml  single-URL sitemap, placeholder domain
```

## Editing copy

Visible page copy lives directly in `index.html` (so the page is fully
readable/indexable with JS disabled). `js/content.js` holds the few values
that are genuinely dynamic/config: `contactEmail`, `formEndpoint`, `social`
links, and the services list used by the mailto fallback. Edit both files
together when changing service names or contact details.

## Enabling the contact form endpoint

The form currently falls back to a `mailto:` link (via `TSL_CONTENT.contactEmail`
in `js/content.js`). To wire up a real endpoint (e.g. Formspree, a Netlify
function, your own API):

1. Set `window.TSL_CONTENT.formEndpoint` in `js/content.js` to the POST URL.
2. The form in `js/main.js` will `fetch()` JSON to that endpoint instead of
   using `mailto:`. Adjust the body shape/headers there if your endpoint
   expects something other than `{name, email, service, message}` as JSON.

## Deploying

Any static host works unchanged — there's no build step.
- **Netlify / Vercel**: point at this folder, no build command needed.
- **GitHub Pages**: push this folder's contents to the repo root (or `/docs`)
  of a Pages-enabled repo.
- Update `<link rel="canonical">`, the Open Graph/Twitter `url`/`image`
  values in `index.html`, and `sitemap.xml` / `robots.txt` with the real
  domain before launch.

## Before launch — TODO placeholders

- [ ] Confirm "Now booking brand builds" is true, or change the announcement bar copy (`index.html`, top).
- [ ] Real contact email (currently `hello@tensenlab.com` placeholder) — `index.html` footer + `js/content.js`.
- [ ] Phone number — footer, marked `[TODO: phone number]`.
- [ ] Studio address — footer, marked `[TODO: studio address]`.
- [ ] Instagram URL — footer social link currently `href="#"`.
- [ ] LinkedIn URL — footer social link currently `href="#"`.
- [ ] Form endpoint — see "Enabling the contact form endpoint" above; currently mailto-only.
- [ ] Production domain — replace `https://www.tensenlab.com/` in `index.html` canonical/OG tags, `robots.txt`, `sitemap.xml`.
- [ ] 4 "Selected work" cards are structural placeholders only — no real client names, tags, or outcomes have been invented. Replace `[Client name]` / `[One-line outcome]` with real case studies before launch, or remove the section.
- [ ] Verify `main logo.zip` doesn't contain a newer/different primary logo file than what was used here.

## Known deviation from the brief

The brief describes `Ten Sen.svg` as containing "a small and a large circle
and a short dash" plus outlined TEN/SEN/LAB letters. On inspection, the
actual SVG is a more compact, fused icon+wordmark (11 paths + 1 rect, no
literal circle or text elements) that doesn't visually match the larger
frame+dots+dash mark visible in `tSLL-07.png`. I used the actual SVG file
as instructed (it's explicitly named the primary web logo), and built the
hero's dot→line animation and decorative work-card icons as separate
inline SVGs modeled on the frame+dots+dash geometry visible in the PNGs,
since that geometry is also present in the brand assets and matches the
"ten (dot) / sen (line)" concept the brief asks the site to be built around.
Flag to the brand owner if the SVG file should be re-exported to match the
PNG lockup exactly.

## Honesty note on the acceptance checklist

This build was produced in a single working session without a full
Lighthouse CI run, full keyboard-only walkthrough, or cross-browser matrix
test — only manual checks at 390px and 1440px in Chrome via automated
screenshots, a console-error check (clean), and a contact-form validation
test. Before calling this launch-ready, run:
- Lighthouse (mobile) in Chrome DevTools and record the four scores here.
- A full keyboard-only pass (skip link, menu, form, all interactive states).
- `prefers-reduced-motion: reduce` emulation to confirm marquee/blur/line
  animations fall back to static states (implemented in CSS/JS but not
  independently re-verified after the mobile-menu CSS fix below).

## Fixes applied during build-out

- `css/styles.css`: `.mobile-menu a` originally matched *all* anchors
  inside the mobile menu, including the "Start a project" button, which
  inherited the huge Archimoto nav-link styling and broke the button.
  Scoped the rule to `.mobile-menu ul a` and gave the CTA button its own
  staggered fade-in.
