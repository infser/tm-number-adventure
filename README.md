# Treasure Ten Island — Make Ten Adventure

Interactive, child-safe static lesson for approximately age 6. Learners connect numerals 0–10 to quantities on a ten-frame, compose ten with number bonds, and solve addition/subtraction story problems within ten.

**Task:** TaskMarket `TSK-B1MHHF16` (Number Adventure: Make Ten)

## Public HTTPS preview

**https://infser.github.io/tm-number-adventure/**

No login required. Source remains runnable offline if hosting changes.

## Repository

- GitHub: https://github.com/infser/tm-number-adventure
- License: MIT (see `LICENSE`)

## Stack

Plain HTML / CSS / JavaScript. No build step, no npm runtime dependency for the lesson, no backend, no analytics, no wallets, no ads.

| File | Role |
|------|------|
| `index.html` | Lesson shell & three activities |
| `styles.css` | Responsive, WCAG-oriented styles |
| `content.js` | Learning content (targets, bonds, stories) |
| `domain.js` | Pure math/state model (testable) |
| `app.js` | UI, navigation, feedback, localStorage |
| `tests/domain.test.js` | Automated domain tests |

## Run locally

```bash
# Option A — any static server
python3 -m http.server 8080
# open http://127.0.0.1:8080/

# Option B — open index.html directly in a modern browser (file://)
```

### Supported browsers / viewports

- Recent Chrome, Firefox, Safari, Edge
- Tested layouts: **360px**, **768px**, **1280px** widths
- Optional browser `speechSynthesis` for read-aloud (visual always works if speech is unavailable)

## Architecture note

- **Activity state:** each activity keeps a 10-slot boolean ten-frame; correctness uses **counts**, not decorative placement order.
- **Content vs UI:** prompts and story text live in `content.js`; scoring/complements in `domain.js`; DOM in `app.js`.
- **Progress:** optional `localStorage` key `treasure-ten-island-v1`. Reset clears it. No server persistence.
- **Scaffold levels:** Light vs Extra help (freely selectable; not labelled as weak/advanced).

## Tests

```bash
node tests/domain.test.js
```

Manual checks (keyboard, touch targets, reset, reduced-motion, feedback) are recorded in `TEST_REPORT.md`.

## Child safety

- No login, wallet, payment, email, or personal data collection
- No ads, tracking, analytics, chat, or social feeds
- No external paid APIs or generative AI at runtime
- Educator references stay in `EDUCATOR_GUIDE.md`

## Known limitations

- Emoji art depends on the OS font; meaning is also conveyed with text/numerals/tables
- Read-aloud quality varies by browser voice pack
- This is a short practice lesson, not a validated diagnostic or full curriculum

## Commands summary

| Goal | Command |
|------|---------|
| Preview | `python3 -m http.server 8080` |
| Domain tests | `node tests/domain.test.js` |
| Production | GitHub Pages from `main` / root |
