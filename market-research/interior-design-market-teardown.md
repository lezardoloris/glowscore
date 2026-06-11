# AI Interior Design App Market — Teardown (juin 2026)

But: décider une app à **gros TAM + gros MRR** (pas du small money), réutilisant le moteur GlowUp AI (photo → fal.ai → paywall RevenueCat) et l'ecom OhMidMod (meubles mid-century) comme angle commerce. Copier 90% (table stakes), innover sur 10% (gaps réels).

## 0. Verdict revenu / TAM

- **TAM**: marché AI interior design **$3,28 Md (2025) → $15 Md (2033)**, CAGR ~21%. Base: ~83M proprios + ~44M locataires US, centaines de M global. B2B: ~3M agents immo US (staging). En 2025 conso dépensent plus sur apps AI que sur jeux (TechCrunch).
- **Revenu = loi de puissance** (la "moyenne" ne veut rien dire):
  - Longue traîne (CSV AppKittie): $34-773 total = junk sans distrib.
  - Indie web SaaS — **Interior AI ~$45-50K MRR** solo (>99% marge), hard paywall, abo $49/$99/$199.
  - **Mobile B2C à l'échelle — Home AI ~$1M sur un seul mois + 700K DL (Sensor Tower)** = ~$12M/an run-rate. Weekly sub $4.99 + paid UA.
  - B2B — Spacely (10× YoY, $1M seed, 1500 firms), Collov (10k+ agents, MLS) = durable mais top-line lent.
  - Perdant — Decor Matters <$5K/mo, en déclin (gamifié/coins).
- **Filtre "not small money"**: seul le modèle **mobile B2C weekly-sub + paid UA (Home AI)** clear la barre gros MRR + gros TAM + scalable. Indie = small money, B2B = lent.
- **Driver de revenu = distribution (UA + créas before/after), pas la qualité du render** (commoditisé ~$0.05/img, marge 90-99%). C'est l'edge media buyer du user.

## 1. Pricing — 2 modèles selon le canal

- **Web/desktop SaaS → crédits/quota freemium.** Ladder standard ~**$14 / $29 / $49 / $99 par mois** (REimagine, Collov, Spacely, VSAI, DreamHouse dans cette bande). Trial 3-10 crédits. Annuel poussé -40 à -50%.
- **Mobile App Store → weekly sub agressif.** **$4.99-$6.99/semaine** (souvent derrière trial 3j auto-converti), + **$29.99-$69.99/an** et **~$99 lifetime**. Vélocité de revenu bien supérieure au web.
- Cost réel ~$0.05/image → marge 90-99%. Le prix est fixé par willingness-to-pay et CAC, pas par le COGS. Tendance: l'unlimited meurt (Spacely passé aux crédits sept 2025, abusé par power users).

### Tableau par app (résumé)
| App | Canal | Pricing | Modèle | Traction |
|-----|-------|---------|--------|----------|
| Interior AI | Web | $49/$99/$199 mo, annuel 6 mois offerts | abo, **hard paywall 0 free** | ~$45-50K MRR solo |
| RoomGPT / RoomsGPT | Web+iOS | web Pro ~$29.99/mo unlimited; iOS weekly ~$5.99 | freemium 3 crédits | "2M users" |
| REimagine Home | Web | $14/$29/$49/$99 (crédits) | crédit freemium, 3 free | B2B/B2C, shop-the-look |
| Reroom AI | Web+iOS+And | $21-25/mo unlimited; team $29-35 | freemium unlimited | cross-platform |
| Planner 5D | Tout | $19.99/mo ou $4.99/mo annuel; Pro ~$399/an | freemium + IAP | **10M+ DL, 120M users claim** |
| Decor Matters | iOS+And | IAP $1.99-49.99 + coins | gamifié coins | **<$5K/mo, déclin** |
| AI Room Design | iOS | **$4.99/sem, $29.99/an, $99.99 lifetime** | weekly freemium (dark patterns) | clone prédateur |
| Home AI / Homestyler | iOS+And | $2.99-6.99/sem, $69.99/an + crédits | weekly freemium | **Home AI ~$1M/mo, 700K DL** |
| Collov AI | Web | $14/$29/$49/$99 crédits; $0.15-0.27/img | crédit B2B + enterprise | **10k+ agents, MLS** |
| Spacely AI | Web+SketchUp | crédits $12.75-102/mo annuel | crédit sub | **$1M seed, 10× YoY, 1500 firms** |
| DreamHouse AI | Web | $39/mo unlimited, 10 free | freemium flat | ~5k homeowners |
| Paintit.ai | Web | $6.99/sem, $24.99/mo, 30 free | crédit + weekly, **shop-the-look commerce** | angle merchant/Shopify |
| Virtual Staging AI | Web | $25-139/mo (photos quota), $0.28-3/photo | quota B2B | pure staging |

## 2. Features — must-have vs différenciateurs vs gaps

**MUST-HAVE (90% à copier, tout winner l'a):**
- Flow upload → room type → style → generate (<30s) → grid variations → download
- ~20+ styles (Modern, Scandinavian, Minimalist, **Mid-Century Modern**, Industrial, Boho, Coastal, Farmhouse, Japandi, Traditional)
- 6 room types core: living, bedroom, kitchen, bathroom, dining, office
- 4+ variations/génération, before/after, redesign pièce meublée
- Free 1-3 générations puis paywall, loop regenerate/try-another-style

**NICE-TO-HAVE (différenciateurs, certains seulement):**
- Virtual staging (pièce vide → meublée) + de-staging/declutter (RoomGPT ne l'a PAS)
- Toggle préservation structure (2D loose vs 3D geometry-locked)
- Sketch-to-render / import SketchUp (funnel pro/archi)
- Mask/édition objet + swap matériau + édition texte (Spacely leader)
- Style custom via image de référence ou prompt
- Upscale HD/4K, vidéo flythrough (Interior AI, Spacely headline)
- Exterior + jardin + espaces commerciaux
- Floor plan 2D/3D + VR (Planner 5D, Homestyler)
- **Shop-the-look** (DecorMatters/Collov natif; Decoratly/Onton/Decory/RoomGenius via visual search)
- Free tier sans watermark (wedge d'acquisition)

**RARE / MANQUANT partout (10% à innover):**
1. **Vidéo before/after short-form TikTok/Reels** (slider-wipe) exportée nativement — PERSONNE. Ils font des flythrough lents, pas l'asset viral.
2. **Shop-the-look haute fidélité sur render libre** — les apps matchent du "similaire" approximatif, jamais l'item exact rendu. Boucle non fermée.
3. **AR + AI redesign fusionnés** — AR (DecorMatters) et redesign AI (les autres) vivent dans des apps séparées.
4. **Estimation budget** par design (coût total + item par item) — quasi absent malgré l'évidence commerce.
5. **Monétisation affiliation/checkout** sur les apps conso — les gros ne prennent que l'abo, laissent la commission meuble sur la table (seuls Collov/Paintit la captent).
6. **Inventaire local/régional** (shop-the-look biaisé vers magasins du pays) — pas vu.

## 3. Le move pour le user (GlowUp + OhMidMod)

Forker GlowUp AI en app **AI interior design mobile B2C** (modèle Home AI):
- **90% copié**: flow + 20 styles + before/after + weekly sub ($4.99/sem, $29.99/an, $99 lifetime) + RevenueCat (déjà câblé).
- **10% innové, edge OhMidMod**: (a) shop-the-look réel sur catalogue SKU OhMidMod = "redesign MCM → achète ces pièces", (b) export vidéo before/after TikTok natif (carburant UA gratuit), (c) estimation budget.
- **Distribution = l'arme**: paid UA Meta/TikTok + créas before/after = métier du user. C'est ce qui sépare Home AI ($1M/mo) de la longue traîne ($34/mo).
- **Double monétisation**: abo app + ventes meubles OhMidMod + commission affiliée. L'app devient canal d'acquisition de l'ecom.

## Sources (sélection)
- Marché: grandviewresearch.com/industry-analysis/ai-interior-design-market-report ; businessofhome.com/articles/the-ai-interior-design-gold-rush-is-on ; techcrunch 2026/01/21 (apps AI > jeux 2025) ; sensortower.com/blog/state-of-ai-apps-market-overview-2025
- Interior AI MRR: thecreatorsai.com ; nomadicblueprint.com/case-studies/pieter-levels ; news.ycombinator.com/item?id=39886361
- Home AI ~$1M/mo: app.sensortower.com/overview/6464476667
- Pricing apps: interiorai.com, roomgpt.io, reimaginehome.ai/pricing, reroom.ai/support/pricing, planner5d.com/pricing, collov.ai/pricing, spacely.ai/pricing, dreamhouseai.com/pricing, paintit.ai, virtualstagingai.app/prices
- Shop-the-look: collov.ai/furniture-ai, decoratly.com, onton.com, decory.ai, homedesigns.ai
