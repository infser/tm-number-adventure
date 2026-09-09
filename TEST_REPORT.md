# TEST_REPORT — Treasure Ten Island (TSK-B1MHHF16)

**Date:** 2026-09-09 (Europe/Rome)  
**Environment:** Headless Chrome 151 / Linux; local `python3 -m http.server 8765`  
**Automated:** `node tests/domain.test.js` → **10/10 PASS**

## Acceptance examples → evidence

| Acceptance example | Evidence | Result |
|---|---|---|
| Every displayed ten-frame has ten distinct slots; counters cannot duplicate in one slot | `domain.js` `createFrame` length 10; `setSlot` toggles a single index; unit test “slots do not duplicate”; UI renders 10 buttons | PASS |
| Starting from seven, adding three visibly completes ten and produces 7+3=10 | Make Ten bond starting at 7; screenshot `screenshots/04b-maketen-7plus3.png`; `D.completesTen(7,3)`; final story quest | PASS |
| Removing four from nine produces five, with no negative quantities | Story 3 (`9−4`); `D.storyAnswer('sub',9,4)===5`; clamp on over-subtract | PASS |
| Zero is represented deliberately rather than treated as missing input | Quantity target 0; Make Ten start 0; Story 4 (`0+8`); numeral word “zero” | PASS |
| Repeated retries do not corrupt the counter state or progress | Clear/Add/Remove idempotent; unit test “retries: clear does not corrupt”; unlimited Check | PASS |
| Learner can complete a fresh final problem with optional hints and see an explanation | Story 7 FINAL QUEST; Hint button; success copy explains 7+3=10; CDP walkthrough completed all 7 stories | PASS |

## Activity screenshots

1. Home / onboarding — `screenshots/01-home-1280.png`
2. Activity 1 Build quantity — `screenshots/03-activity1-quantity.png`
3. Activity 2 Make ten — `screenshots/04-activity2-maketen.png` (+ `04b-maketen-7plus3.png`)
4. Activity 3 Stories — `screenshots/05-activity3-stories.png`
5. Mobile 360px — `screenshots/02-mobile-360-quantity.png`
6. Tablet 768px — `screenshots/06-tablet-768.png`
7. Completion summary — `screenshots/07-summary.png`

Numbered walkthrough (CDP simulated learner, Chrome 151):

1. Open preview → Start adventure  
2. Match targets 0,3,7,10,5 on ten-frame → Activity 1 complete  
3. Complete bonds 0,5,7,2,9 → Activity 2 complete  
4. Solve 6 guided stories + final quest → Summary  

## Manual checks

| Check | Steps | Observed |
|---|---|---|
| Keyboard | Tab to controls; `+`/`-` add/remove; slot buttons focusable | Focus ring visible (CSS `:focus-visible`); add/remove works |
| Touch targets | Buttons/slots ≥48px in CSS (`--touch: 48px`) | PASS at 360/768/1280 |
| Reset | Reset lesson clears `localStorage` and returns home | PASS |
| Feedback | Wrong answer → strategy hint (empty spaces / count on); correct → specific confirmation | PASS |
| Reduced motion | `prefers-reduced-motion: reduce` zeroes transitions | Present in `styles.css` |
| No drag required | Add/Remove/slot tap alternatives | PASS |
| Child safety | No login/wallet/ads/analytics/network calls in lesson JS | Static only; optional speechSynthesis |

## Automated domain tests (actual run)

```
PASS: ten-frame always 10 slots
PASS: cannot conceptually exceed 10 via createFrame
PASS: slots do not duplicate fill count when setting same slot
PASS: addOne fills first empty; removeOne clears last filled
PASS: zero represented deliberately
PASS: starting from seven, adding three completes ten → 7+3=10
PASS: removing four from nine produces five; no negatives
PASS: bonds include 0+10 and 5+5
PASS: retries: clear does not corrupt
PASS: checkStory matches expected
Passed 10 tests
```

## Viewports

- 360px, 768px, 1280px screenshots captured (see above). No intentional horizontal scroll of core controls.

## Known limitations noted

Emoji rendering depends on OS fonts; meaning duplicated via numerals/text/table.
