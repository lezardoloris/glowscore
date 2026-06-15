# Plus-Size Epic — 10-perspective review (2026-06-15)

Synthesized review after implementation. Smoke test: `npx tsx scripts/verify-plus-size-recos.ts` → **PASS** (5 product recos, persona `us_plus_size`).

## 1. Data integrity (PS-0)
**Status: PASS**
- `GOAL_TO_CONCERNS.body_glow` aligned with canonical concern ids.
- `contextFromQuiz({ goals: ['body_glow'] })` sets `persona: 'us_plus_size'`.
- `body_oil` mapped in `categoryMap`; Annexe B products present in `products.ts`.
- `reco_035b` / `reco_035c` added for hyperpigmentation + body hydration.

## 2. Compliance / Apple-safe copy
**Status: PASS (with notes)**
- Grep across `app/` + `src/`: no shame/weight-loss copy in UI. Forbidden terms only appear in `bodyCareSafety.ts` blocklist.
- Worker `destress` negative prompt correctly avoids weight-loss framing.
- `skin-change-track.tsx`: no weight/IMC fields; wellness framing for volume change.
- **Note:** concern id `peau_relachee_post_weight_loss` is internal only; user-facing copy uses "support through change".

## 3. Body Care Hub (PS-1)
**Status: PASS**
- `app/body-care.tsx`: 5 zones, protocols from `bodyCareProtocols.ts`, AVOID list, timelines, disclaimer.
- `ProductRecoCard` + reco wiring via `recommendForQuiz`.
- Home entry on `(tabs)/index.tsx`; Plan tab re-exports `glow-plan.tsx` which now links to Body Care hub.

## 4. Reco wiring (glow-plan, scan-result, body-care)
**Status: PASS**
- `glow-plan.tsx` and `scan-result.tsx` call reco engine with profile/concerns context.
- Body glow goal yields Megababe, CeraVe Healing, Mario contour, peptides, Palmer's.

## 5. De-bloat (PS-2)
**Status: PASS**
- `debloat-morning.tsx`: 4 timed steps, structural tips, haptics on start/step/complete.
- Timer refactored (`stepRef` + `advanceStep`) — fixes stale closure bug.
- `stress-scan.tsx` links to 5-min routine after 8-min routine completes.

## 6. Makeup round face (PS-3)
**Status: PASS (PS-3.2 AR overlay partial)**
- `makeup-round-face.tsx`: contour guide, anti-cake, SVG overlay guides (not live camera AR).
- Worker `contour_round` preset for AI try-on.

## 7. Post-change track (PS-4)
**Status: PASS**
- `skin-change-track.tsx`: photo journal, firmness/glow/density sliders, education copy, disclaimer.
- `FOCUS_TASKS` + `routineCopy` entries for `skin_through_change`.

## 8. Routes & navigation
**Status: PASS**
- `_layout.tsx` registers: `body-care`, `makeup-round-face`, `debloat-morning`, `skin-change-track`.
- `feature-hub.tsx`: Body Care, Round Face Makeup, Posture Glow rename.

## 9. Design system alignment
**Status: PASS**
- New screens use `theme`, `typography`, `shadows`, `radii`.
- `stress-scan.tsx` still uses legacy inline font weights (pre-existing; not regressed).

## 10. Acquisition / docs (PS-6)
**Status: PARTIAL**
- ✅ `docs/ASO-PLUS-SIZE.md`, `docs/UGC-CREATORS-PLUS-SIZE.md`, TikTok scripts markdown.
- ⬜ PS-6.3 free web lite de-bloat → Vercel waitlist (not built).
- ⬜ PS-5.3 inclusive Gemini imagery (not generated).

## Remaining gaps (non-blocking)
| Item | Priority |
|------|----------|
| PS-5.3 representative imagery | P1 marketing |
| PS-6.3 web lite funnel | P2 growth |
| PS-3.2 live camera AR overlays | P2 advanced |
| Dedicated Body Care tab icon (vs home + plan link) | P3 UX polish |

## Done criteria checklist
- [x] `npx tsc --noEmit` (expo-app)
- [x] Recos plus-size >= 3 on `body_glow`
- [x] No forbidden UI copy introduced
- [x] `npx expo export -p web` (expo-app/dist)
