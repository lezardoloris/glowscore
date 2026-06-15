# Amazon Associates — Phased URL Rollout

> **Launch language: English only (US market).** FR/UK affiliate tags come later with locale expansion.
> **Current state:** all products use `getAffiliateUrl()` → `https://glowupai.app/go/{id}?m={market}` until each wave is wired.

## Why phased (not all at once)

1. Amazon Associates approval + tag setup takes time.
2. ASINs change; links need manual QA per SKU.
3. Redirect worker (`glowupai.app/go/*`) lets us swap URLs without an app release.
4. We validate **click-through** on placeholders first, then invest in real links for top converters.

## Architecture (target)

```
App tap → getAffiliateUrl(product, 'us')
       → https://glowupai.app/go/body_glide?m=us   (today)
       → 302 → https://www.amazon.com/dp/ASIN?tag=YOURTAG-20   (per wave)
```

**Code touchpoints**

| File | Role |
|------|------|
| `src/services/products.ts` | `affiliate.us` / `affiliate.uk` per SKU |
| `src/services/recoEngine.ts` | `getAffiliateUrl()` at tap time |
| Worker / Vercel redirect | `/go/:id` maps id → Amazon URL + analytics |

**Do not** hardcode tags in the client only — always route through `/go/` for swap + tracking.

---

## Wave 0 — Now (done)

- [x] Product catalog with `id`, `markets`, optional `affiliate` map
- [x] Fallback redirect URL per product
- [x] `trackEvent('product_tapped', { id, rule })` on glow-plan reco cards
- [ ] Redirect worker live on `glowupai.app/go/*` (infra — not in app repo)
- [ ] Amazon Associates US account + store ID `YOURTAG-20`

---

## Wave 1 — P0 body care + debloat (8 SKUs)

**When:** after Associates approved + redirect worker deployed  
**Why first:** persona US differentiation + highest whitespace vs competitors

| `id` | Product | ASIN (to fill) | Notes |
|------|---------|----------------|-------|
| `body_glide` | Body Glide Anti-Chafe | TBD | Hero SKU body_glow persona |
| `palmers_cocoa` | Palmer's Cocoa Butter | TBD | |
| `bio_oil` | Bio-Oil | TBD | |
| `inkey_caffeine` | INKEY Caffeine Eye Serum | TBD | Debloat AM |
| `theordinary_caffeine` | The Ordinary Caffeine Solution | TBD | |
| `mountlai_guasha` | Mount Lai Gua Sha | TBD | Tool, often Amazon |
| `cosrx_snail` | COSRX Snail 96 Mucin | TBD | Glass skin anchor |
| `medicube_pdrn` | Medicube PDRN Pink Peptide | TBD | TikTok darling |

**AC:** each id resolves via `/go/{id}` to tagged Amazon URL; QA tap on iOS + Android.

---

## Wave 2 — Skin core (10 SKUs)

| `id` | Product |
|------|---------|
| `cerave_pm` | CeraVe PM Lotion |
| `lrp_anthelios` | LRP Anthelios SPF50+ |
| `cosrx_lowph` | COSRX Low pH Cleanser |
| `ordinary_niacinamide` | The Ordinary Niacinamide |
| `boj_glow_serum` | Beauty of Joseon Glow Serum |
| `anua_heartleaf` | Anua Heartleaf Toner |
| `paulaschoice_bha` | Paula's Choice 2% BHA |
| `medik8_retinal` | Medik8 Crystal Retinal |
| `numbuzin_no5` | Numbuzin No.5 Serum |
| `bobbi_corrector` | Bobbi Brown Under Eye Corrector |

---

## Wave 3 — Premium + makeup + hair (9 SKUs)

| `id` | Product |
|------|---------|
| `skinceuticals_ceferulic` | SkinCeuticals C E Ferulic |
| `medik8_liquid_peptides` | Medik8 Liquid Peptides |
| `ilia_skintint` | ILIA Super Serum Skin Tint |
| `saie_glowy` | Saie Glowy Super Gel |
| `mario_contour` | Makeup by Mario Sculpt Stick |
| `glowrecipe_plum` | Glow Recipe Plum Plump |
| `maelove_glowmaker` | Maelove Glow Maker Vit C |
| `kerastase_glass` | Kerastase Glass Hair Serum |
| `theordinary_multipeptide_hair` | The Ordinary Hair Peptide |

---

## Wave 4 — UK / FR markets

- Separate tags: `YOURTAG-21` (UK), `YOURTAG-22` (FR) or region-specific programs.
- Fill `affiliate.uk` / `affiliate.fr` in `products.ts` only when App Store / Play listing targets those locales.
- **Not in scope for English-only US launch.**

---

## How to add a URL (per SKU checklist)

1. Find stable ASIN on Amazon (same pack size as listed in app).
2. Build: `https://www.amazon.com/dp/{ASIN}?tag={US_TAG}`
3. Add to redirect worker map: `{ id: 'body_glide', us: '...' }`
4. Optionally mirror in `products.ts`:

```ts
{
  id: 'body_glide',
  // ...
  affiliate: { us: 'https://glowupai.app/go/body_glide?m=us' },
}
```

5. Tap test + confirm `product_tapped` event in analytics.
6. Mark row ✅ in this doc.

---

## Compliance

- Disclose affiliate relationship in App Store description + in-app reco subtitle (already: "Affiliate links support the app").
- No medical claims on product names in copy.
- Amazon Operating Agreement: no link shortening that hides destination (our `/go/` redirect must land on Amazon).

---

## Related epics

- **EPIC 13.5** — Amazon Associates IDs (this roadmap)
- **EPIC 13.4** — Affiliate revenue tracking (partial: `product_tapped`)
- **EPIC 8.9** — ~~i18n FR~~ **cancelled for launch** → English-only; FR copy kept in `routineCopy.ts` archive only
