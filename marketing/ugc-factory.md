# GlowScore AI UGC Factory (operational playbook)

Existing assets: `Desktop\GlowUp-AllImages` (reuse before generating new).

## 1. Persona bank (Nano Banana characters, keep seeds/refs consistent)
| Persona | Age | Descriptor (paste into prompt) |
|---|---|---|
| Maddie | 19 | US college girl, light freckles, messy bun, dorm lighting, hoodie, casual selfie energy |
| Jasmine | 24 | Black American, NYC creative, glossy curls, gold hoops, ring light, confident but self-aware |
| Sofia | 29 | Latina marketing manager, soft glam, apartment mirror shots, skincare-obsessed tone |
| Rachel | 34 | White suburban mom, minimal makeup, kitchen/car lighting, "no time for myself" angle |

Rules: one face per persona forever (character refs in Higgsfield), iPhone-look, vertical 9:16, slightly imperfect lighting. Never use the word "ugly" on screen.

## 2. Before/after ad format (the one recipe)
1. **Hook, 0-2s**: face close-up + bold text overlay (see scripts below). No logo.
2. **Scan, 2-5s**: GlowScore scan overlay animates over her face (grid lines, metrics ticking).
3. **Blurred reveal, 5-9s**: score card appears blurred, she reacts ("wait, what"), partial unblur of one metric only.
4. **CTA, 9-12s**: "Find out your score" + app UI flash + App Store badge.
Keep total 10-13s. Sound: trending audio low + her VO on top.

## 3. Weekly cadence
- Mon: pick last week's winner (lowest CPA with spend > $30).
- Tue-Wed: produce 10-12 variants of the winner: swap persona (x4), swap hook line (x3), swap first frame only (x3-5). Change ONE variable per variant.
- Thu: launch all in one new Smart+ campaign, kill nothing for 48h.
- Sun: cut anything with CTR < 0.6% after $20 spend.

## 4. Tools pipeline
1. Higgsfield MCP: `generate_image` (persona stills, before/after frames, character ref locked) then `generate_video` (talking/reaction clips, 5s segments).
2. CapCut: assemble segments, add scan overlay template, captions (auto, pink #E0537A highlight), trending sound.
3. Postbridge: schedule organic posts to TikTok/Reels/Shorts (3/day per persona account); export winners' raw files for paid.

## 5. TikTok Smart+ settings
- Smart+ campaign, US only, $50/day, optimize for Purchase (fallback: app install only week 1 until 50 purchases signal).
- Broad targeting, women 18-44, no interest stacking, let Smart+ pick placements.
- 10-12 creatives per campaign, refresh weekly, never edit a winning ad (duplicate instead).

## 6. KPIs (check daily)
- CPI < $2
- CTR > 1% (kill < 0.6%)
- CPA < $30 (LTV ~ $30; week-1 target CPA < $25 for margin)
- Hook rate (3s view) > 30%, hold rate (75% watched) > 15%

## 7. Compliance
- All AI personas: enable TikTok's "AI-generated content" label on organic posts and tick the AIGC disclosure in Ads Manager. Required by TikTok policy and increasingly by law (EU AI Act style rules). No medical or guaranteed-outcome claims ("can improve" not "will fix"). No before/after implying cosmetic procedure results.

## 8. First 3 hook scripts
**Hook 1 (Maddie, 19):** "I asked AI to rate my face and I was NOT ready." (text overlay: POV: the app is brutally honest) Scan runs, she covers her mouth, blurred score, "okay download it and tell me yours."

**Hook 2 (Jasmine, 24):** "My friend got a 9.1 on this app so obviously I had to check mine." Scan over her face, eyes widen at blurred card, "the jawline score is crazy accurate. Link in bio."

**Hook 3 (Rachel, 34):** "34, two kids, zero skincare routine. Let's see what the AI says." Scan, soft laugh at blurred result, "it actually gave me a plan to fix it. Honestly worth it."
