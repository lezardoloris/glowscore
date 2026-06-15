# EPIC & Stories - Femmes US plus-size ("Glow at any size") | Plan Cursor-ready

Vertical différenciant, **100% femmes, marché US uniquement**. Source: [persona-us-plus-size-research.md](glowscore-2026-06/persona-us-plus-size-research.md) + [clinical-market-report-plus-size-women-2026-06.md](glowscore-2026-06/clinical-market-report-plus-size-women-2026-06.md).

Statut: ✅ fait / 🟡 partiel / ⬜ à faire. Style: pas de tirets cadratins.

## Règle d'or (à coller en tête de chaque PR Cursor)
Beauté, confiance, confort. **JAMAIS** perte de poids, IMC, calories, reco GLP-1, "éliminer le double menton", shame. Cadrage: "Glow at any size", "support your skin through change", "feel good in your skin today". C'est ce qui rend l'app différenciante, bienveillante ET Apple-safe.

## Pourquoi (TAM + whitespace)
67% des femmes US en taille 14+, 40% obésité adulte, 65% se sentent ignorées par la beauté, ~31M sous GLP-1. Elles cherchent en termes beauté (debloat face, makeup round face, chub rub, ozempic face skincare), jamais "weight loss". Le **body care** (chafing/plis/intertrigo/hydratation) est un whitespace quasi vide, produits <$25 = revenus affiliés. Aucun concurrent ne combine diagnostic + visage + corps + suivi avec un ton inclusif non élitiste.

## Fichiers clés (pour Cursor)
- Plan/tâches: [glowPlan.ts](../expo-app/src/services/glowPlan.ts) (FOCUS_TASKS, buildPersonaTasks, PLAN_CATEGORY_GROUPS, savePlanForProfile/FromConcerns)
- Reco: [recoEngine.ts](../expo-app/src/services/recoEngine.ts) (GOAL_TO_CONCERNS, CONCERN_TO_RECO, contextFromQuiz/Concerns, recommendProducts) + [products.ts](../expo-app/src/services/products.ts) (GlowProduct, PRODUCTS) + [reco-rules.json](../expo-app/src/data/reco-rules.json) (reco_031-035)
- Concerns: [concerns.tsx](../expo-app/app/concerns.tsx) + [concernHeads.ts](../expo-app/src/config/concernHeads.ts)
- Onboarding: [onboarding.tsx](../expo-app/app/onboarding.tsx) (goals, body_glow)
- Écrans: [glow-plan.tsx](../expo-app/app/glow-plan.tsx), [stress-scan.tsx](../expo-app/app/stress-scan.tsx), [scan-result.tsx](../expo-app/app/scan-result.tsx), [pricing.tsx](../expo-app/app/pricing.tsx)
- Worker: [index.ts](../CloudflareWorker/src/index.ts)
- Design: [theme.ts](../expo-app/src/theme.ts), typography.ts, shadows.ts ; copy: [routineCopy.ts](../expo-app/src/data/routineCopy.ts)

---

## EPIC PS-0 - Fixes data-integrity (P0, bloquants, à faire EN PREMIER)
Bugs trouvés à la relecture: les recos plus-size ne se déclenchent jamais et les concerns ne matchent pas. Sans ça, tout PS-3/PS-4 est mort silencieusement.

| Story | Problème | Fix attendu (AC) | Fichier |
|---|---|---|---|
| PS-0.1 | `GOAL_TO_CONCERNS.body_glow` = `['irritation_plis','frottements_cuisse','peau_transformation']` mais les règles utilisent `intertrigo_plis`, `chafing_cuisses`, `peau_relachee_post_weight_loss`. Aucun match. | Aligner les ids: `body_glow` -> `['chafing_cuisses','intertrigo_plis','double_menton_maquillage','peau_relachee_post_weight_loss','vergetures_inconfort']`. Vérifier que `recommendProducts(contextFromQuiz({goals:['body_glow']},{persona:'us_plus_size'}))` renvoie >= 3 recos. | recoEngine.ts | ✅ |
| PS-0.2 | Règles `reco_031-035` exigent `persona:"us_plus_size"` mais `contextFromQuiz` force `persona:'all'` par défaut -> `matchesRule` ligne `cond.persona==='us_plus_size' && ctx.persona!=='us_plus_size'` -> jamais. | Quand `goals` contient `body_glow` (ou onboarding plus-size), set `persona:'us_plus_size'` dans le contexte. Ajouter param ou détection. AC: les 5 règles plus-size firent en test. | recoEngine.ts (+ appelants glow-plan.tsx) | ✅ |
| PS-0.3 | `pickProduct` mappe `body_care`->'body' et `anti_chafe`->'anti_chafe', OK, mais `reco_035` a `product_category:"body_oil"` non mappé -> produit null. | Ajouter `body_oil: 'body'` au `categoryMap`. AC: reco_035 renvoie Bio-Oil/Palmer's. | recoEngine.ts | ✅ |
| PS-0.4 | Concern tags produits incohérents: products.ts utilise `body_fold`/`body_hydration` (pas dans les rules) et `chafing_cuisses`/`vergetures_inconfort` (dans les rules). | Normaliser la taxonomie en un set unique documenté (voir Annexe A). Mettre à jour products.ts concernTags + reco-rules + CONCERN_TO_RECO. AC: tout id de concern référencé existe des deux côtés. | products.ts, reco-rules.json, recoEngine.ts | ✅ |
| PS-0.5 | `skinType` hardcodé `'tous'` dans contextFromQuiz/Concerns -> les règles `skin_type` spécifiques peuvent sur/sous-matcher. | Laisser `'tous'` ne bloque rien (déjà le cas via `cond.skin_type!=='tous'`), mais exposer un override depuis onboarding si dispo. AC: pas de régression. | recoEngine.ts | ✅ |

---

## EPIC PS-1 - Body Care Hub (LE différenciateur, P0) ⭐
Outil d'aide à la décision pour le soin des plis et frottements. Whitespace clinique, produits <$25.

| Story | Description | AC | Statut |
|---|---|---|---|
| PS-1.1 | **Écran Body Care Hub** `app/body-care.tsx` | Entrée depuis home + tab. Sélecteur de zone d'inconfort: sous-poitrine, ventre/plis, aine/cuisses, dos, bras. Chaque zone -> protocole. Design system rose (theme/typography/shadows). | ✅ |
| PS-1.2 | **Protocole intertrigo/plis** | Données dans `src/data/bodyCareProtocols.ts`: nettoyage (syndet doux + pyrithione zinc 2x/sem), séchage (tapoter + air froid), barrière (oxyde de zinc OU poudre miconazole sans talc), séparation gaze. **Garde-fou codé**: liste `AVOID = ['cornstarch','amidon de maïs','witch hazel','hamamélis','alcohol']` affichée en "À éviter". | ✅ |
| PS-1.3 | **Protocole chafing ("chub rub")** | Textile (short cycliste), lubrifiant solide (Body Glide/Megababe), hygiène post-effort. Reco produits via recoEngine (concern `chafing_cuisses`). | ✅ |
| PS-1.4 | **Hyperpigmentation frictionnelle** | Actifs sûrs: azélaïque, niacinamide, tranexamique, glycolique faible %. Short-contact therapy expliquée. Délais réalistes affichés: 8-12 sem visible, 3-6 mois stabilisé. Ton non-shame. | ✅ |
| PS-1.5 | **Vergetures confort** | Distinguer rubrae (rétinol OTC + AH) vs albae (hydratation: beurre cacao, rose musquée, Centella). Copy "confort/souplesse", jamais "effacer". Reco Bio-Oil/Palmer's. | ✅ |
| PS-1.6 | **Tâches plan body care** | `FOCUS_TASKS.bodycare` existe (5 items). Ajouter `body_fold_care` détaillé (garder plis secs) + `body_hydration_layer` (wash->oil->butter). Brancher quand `body_glow` goal. | ✅ |

## EPIC PS-2 - De-Bloat Assistant (visage, P0 quick win)
Routine guidée 5 min. On a déjà le Stress-Faciomètre; ici on ajoute la version "morning de-bloat".

| Story | Description | AC | Statut |
|---|---|---|---|
| PS-2.1 | **Routine guidée 5 min** | Réutiliser le moteur de stress-scan.tsx. 4 étapes chronométrées: cryo 1 min, stimulation lymphatique 1 min (lobes vers le bas, pompage derrière oreilles), gua sha 2 min (centre->oreilles, cou->clavicules), périorbitaire 1 min. Compte-à-rebours visuel + haptics. | ✅ |
| PS-2.2 | **Tips structurels** | Dormir tête surélevée, sodium < 2000 mg. Affichés en fin de routine (pas de tracking de poids/calories). | ✅ |
| PS-2.3 | **Stress-Faciomètre = entrée mise en avant** | CTA home "Check your cortisol face" déjà là pour ce persona. | ✅ |

## EPIC PS-3 - Makeup Positioning Module (visage rond, P0 quick win)
Cluster recherche "élevé" (15-22k/mois "makeup for round face").

| Story | Description | AC | Statut |
|---|---|---|---|
| PS-3.1 | **Guide "Makeup for round face"** `app/makeup-round-face.tsx` | Étapes: contour V froid (tempes, creux joues haut-oreille->coin bouche mi-chemin, mâchoire, estomper vers le HAUT), blush oblique vers tempes, enlumineur vertical central, eyeliner ailé, sourcils arche nette. Produits reco (Mario Soft Sculpt, etc.). | ✅ |
| PS-3.2 | **Overlay AR guides** (avancé) | Sur photo/caméra, superposer lignes de tracé (V contour, axe blush, axe highlight). Réutiliser camera-scan.tsx. | 🟡 (SVG guides statiques, pas caméra live) |
| PS-3.3 | **Anti-cake** | Apprêt, voile, fini cloud skin. Tips + produits. | ✅ |
| PS-3.4 | **AI try-on contour léger** | Preset Gemini "subtle cool contour, identity preserved" via Studio + Worker `/api/transform`. | ✅ |

## EPIC PS-4 - Post-Change Track (post-GLP-1, P0)
Journal pour perte de volume rapide. **Cadrage strict: "support skin through change", jamais "reverse".**

| Story | Description | AC | Statut |
|---|---|---|---|
| PS-4.1 | **Track "Support your skin through change"** | Routine: peptides cuivre/signalisation, rétinoïdes légers (rétinol/rétinaldéhyde), Proxylane/AH fragmenté, SPF 30-50. `FOCUS_TASKS` dédié + reco (reco_034). | ✅ |
| PS-4.2 | **Journal peau (pas poids)** | Suivi photo "skin through change", delta fermeté/densité/éclat. **Exclure tout champ poids/IMC/calorie** de la data. | ✅ |
| PS-4.3 | **Education douce** | Expliquer "Ozempic face" en bien-être (perte de volume), sans claim médical. Disclaimer "consulter un pro". | ✅ |

## EPIC PS-5 - UX inclusive & confiance (P0, conformité + marque)
| Story | Description | AC | Statut |
|---|---|---|---|
| PS-5.1 | Goal onboarding **`body_glow`** | "Body glow & comfort". | ✅ |
| PS-5.2 | Tagline **"Glow at any size"** home | Hero testable. | ✅ |
| PS-5.3 | **Imagerie représentative** | Générer (Gemini) têtes/visages + zones corps taille +, peaux variées. Remplacer placeholders. | ✅ (Body Care = `bodycare.png` femme taille + carnation foncée; home hero = `home_hero.png` portrait femme taille + carnation tan; onboarding = texte, pas d'image. Carnations + still-life staged dans `_candidates/`. Reste optionnel: cartes diagnostic scan-result encore génériques) |
| PS-5.4 | **Copy anti-shame audit** | Passe globale: bannir "fix/flaw/eliminate/problem area/lose". Remplacer par support/comfort/care/glow. Centraliser dans routineCopy.ts. | ✅ |
| PS-5.5 | **Confiance données** | Selfie supprimé/jamais vendu, écran consentement. | ✅ |
| PS-5.6 | **Indicateur sans poids** | Vérifier qu'aucun écran/score n'introduit poids/IMC/calorie. Score = barrière, teint, souplesse, éclat. | ✅ |
| PS-5.7 | **Base ingrédients sécurisés** | `ingredients.ts` + filtre INCI: flag talc, parfums irritants, hamamélis sur zones érodées. | ✅ |

## EPIC PS-6 - Acquisition (search intent -> ASO + contenu)
| Story | Description | AC | Statut |
|---|---|---|---|
| PS-6.1 | **ASO mots-clés persona** | Titre/sous-titre/keywords App Store autour de "chub rub body relief", "how to depuff round face", "skin laxity support", "makeup for round face". Jamais via poids. Doc `docs/ASO-PLUS-SIZE.md`. | ✅ |
| PS-6.2 | **3 scripts TikTok** | De-bloat 5 min, round-face makeup, chub-rub fix. Hooks + CTA app. Dans `market-research/glowscore-2026-06/contenu-beaute-prompts.md`. | ✅ (`tiktok-plus-size-scripts.md`) |
| PS-6.3 | **Free web "lite" de-bloat scan -> waitlist** | Top of funnel sur la landing Vercel. | ⬜ |
| PS-6.4 | **UGC Creator Matrix** | Shortlist 15 créatrices (voir rapport clinique sec. 4.3) + brief outreach. `docs/UGC-CREATORS-PLUS-SIZE.md`. | ✅ |
| PS-6.5 | **Affiliation body care** | Body Glide, Palmer's, Bio-Oil, Megababe, Gold Bond, CeraVe en vague 1 (AFFILIATE-ROADMAP). | ✅ |

---

## Ordre d'exécution recommandé (pour Cursor)
1. **EPIC PS-0** (fixes data) - sinon le reste est invisible. ~1 session.
2. **PS-1.1/1.2/1.6** Body Care Hub + protocoles (le différenciateur, data-driven).
3. **PS-2.1** De-bloat 5 min + **PS-3.1** makeup round face (quick wins contenu).
4. **PS-4.1/4.2** Post-change track.
5. **PS-5.3/5.4** imagerie inclusive + audit copy.
6. **PS-6** ASO + UGC + affiliation (parallélisable, non-code).

## Définition de "Done" globale
- tsc clean (`npx tsc --noEmit` dans expo-app + CloudflareWorker).
- `npx expo export -p web` passe.
- Aucun terme interdit (poids/IMC/calorie/shame) introduit.
- Recos plus-size vérifiées (>= 3 sur body_glow).
- Préviews Vercel OK sur mobile.

---

## Annexe A - Taxonomie concerns plus-size (canonique)
Utiliser EXACTEMENT ces ids partout (products.concernTags, reco-rules.if.concern, CONCERN_TO_RECO, GOAL_TO_CONCERNS):

| id canonique | Sens | Produits liés |
|---|---|---|
| `chafing_cuisses` | Frottement cuisses/aisselles | Body Glide, Megababe, Gold Bond |
| `intertrigo_plis` | Irritation plis (sous-poitrine, ventre) | CeraVe Healing, Triple Paste, Zeasorb |
| `hyperpigmentation_friction` | Taches zones de frottement | azélaïque, niacinamide, tranexamique |
| `vergetures_inconfort` | Vergetures (confort, pas effacer) | Palmer's, Bio-Oil, Centella |
| `double_menton_maquillage` | Contour visage rond | Makeup by Mario Soft Sculpt |
| `visage_gonfle` | De-bloat / cortisol | Gua sha, caféine |
| `peau_relachee_post_weight_loss` | Laxité post-GLP-1 | peptides cuivre, rétinal, Proxylane, SPF |
| `body_hydration` | Hydratation corps couches | Palmer's, CeraVe cream |

## Annexe B - Produits à ajouter dans products.ts (du rapport clinique)
| id | brand | name | category | concernTags | tier |
|---|---|---|---|---|---|
| megababe_thigh | Megababe | Thigh Rescue | anti_chafe | chafing_cuisses | budget |
| gold_bond_friction | Gold Bond | Friction Defense | anti_chafe | chafing_cuisses | budget |
| cerave_healing | CeraVe | Healing Ointment | body | intertrigo_plis, body_hydration | budget |
| zeasorb_af | Zeasorb | AF Powder | body | intertrigo_plis | budget |
| the_ordinary_azelaic | The Ordinary | Azelaic Acid 10% | treatment | hyperpigmentation_friction | budget |

## POST-REVIEW STATUS (2026-06-15, après review 5 agents)
Voir [review-5-agents-plus-size-2026-06.md](review-5-agents-plus-size-2026-06.md).

**Fait + vérifié par Claude (lane data/logique, tsc clean + test runtime + banned-terms check OK):**
- PS-0 complet: ids alignés, persona auto `us_plus_size`, `body_oil` mappé, taxonomie complétée (produits cerave_healing + theordinary_azelaic, tag peptides post-change, règle hyperpigmentation). Test runtime: `body_glow` -> 6 recos avec les BONS produits (Body Glide, CeraVe Healing, Mario, Medik8 Peptides, Palmer's).
- Régression experience corrigée (plancher), skinType en wildcard (débloque 5 concerns visage), dedup garde l'avis sans carte dupliquée.
- Conformité data: produit médicament `zeasorb_af` retiré, noms OTC (miconazole/pyrithione) retirés des protocoles, claim "firmness"/"not medical" reframé, marque "Ozempic" retirée de skin-change-track, "calorie" retiré, tea_tree role "Antifungal"->"Purifying".
- Garde-fous codés: `src/data/bodyCareSafety.ts` (BANNED_TERMS, AVOID_INGREDIENTS filtre DUR dans recoEngine.pickProduct, DISCLAIMER, `AFFILIATE_DISCLOSURE`), `scripts/check-banned-terms.mjs` (gate CI), disclosure FTC rendue dans `ProductRecoList`.
- CRIT-2: `buildPersonaTasks` réserve >=2 slots Body Care quand `body_glow` (SPF + selfie + 2 body care + 1 focus).

**Fait par Cursor (lane écrans, en cours):** `app/body-care.tsx` (hub zone->protocole + recos branchées = CRIT-1 résolu), `src/data/bodyCareProtocols.ts`, `app/skin-change-track.tsx`, `app/makeup-round-face.tsx`, composant `ProductRecoCard`.

**PS-1 finalisé + poli (2026-06-15, lane écrans, tsc clean + check:copy OK):**
- Hub extrait en composant partagé `src/components/BodyCareHub.tsx`. `app/body-care.tsx` = route stack (avec back), `app/(tabs)/body.tsx` = nouvel onglet **Body** (`(tabs)/_layout.tsx`) -> entrée "home + tab" satisfaite (PS-1.1).
- Triage ajouté: zone -> 1 question symptôme -> tip ciblé (réutilise le pattern `Question` de stress-scan).
- `SEE_A_PRO` rendu en off-ramp calme sur les zones plis (under_bust + belly_folds, flag `medicalOfframp`) + surfacé via l'option triage "spreading/weepy".
- PS-1.4: acide tranexamique ajouté aux actifs du dos. PS-1.5: beurre de cacao, rose musquée, Centella (albae) + rétinol OTC + AHA (rubrae).
- Liste "à éviter" complète, version anglais propre (`AVOID_DISPLAY`), en chips calmes "better to skip" (plus de boîte alarme rouge).
- Studio: Body Care ouvre sans selfie (`noPhoto` dans `feature-hub.tsx`) -> friction retirée.
- PS-1.6: task ids stables `body_fold_care` + `body_hydration_layer` (+ `body_anti_chafe`) dans `glowPlan.ts`.
- Cadence "This week" par zone. FTC: tag "Affiliate" inline sur chaque carte reco. `check-banned-terms.mjs` câblé dans `package.json` (`typecheck` / `check:copy` / `verify`).
- PS-5.3: imagerie inclusive générée via Gemini `gemini-2.5-flash-image`. Body Care tuile Studio + hero hub = `assets/components/bodycare.png` (femme taille +, carnation foncée, athleisure crème). Home first-run hero = `assets/components/home_hero.png` (portrait femme taille +, carnation tan). Onboarding = texte (pas d'image). Variantes carnations + still-life dans `assets/components/_candidates/`. Script repro: `scripts/gen-bodycare-art.mjs` (lire `GEMINI_API_KEY` en env; Node `--use-system-ca` requis derrière le proxy TLS).

**Reste à faire (priorisé):**
- P0: free web lite scan + soft paywall (GTM-2), consentement séparé photos corps (PRIV-1), retirer "treatment plan"/Botox de l'onboarding (WORD-1).
- P1: De-Bloat 5 min en composant `GuidedRoutine` partagé extrait de stress-scan, audit copy anti-shame global, imagerie inclusive restante (têtes/visages onboarding + home hero, via `scripts/gen-bodycare-art.mjs`), retirer le gate invite-3.
- P2: dayKey en date locale (anti off-by-one rétention), loop notifications lifecycle, plan CAC-LTV + attribution, UGC vague 1 (Katie Sturino).
- Doublon mineur à nettoyer: hyperpigmentation couverte par reco_035b (Cursor) ET reco_048 (Claude); garder une seule règle.

## Annexe C - Garde-fous codables (à mettre en data, pas en prose)
```ts
// src/data/bodyCareSafety.ts
export const AVOID_INGREDIENTS = ['cornstarch','amidon de maïs','witch hazel','hamamélis','alcohol','denatured alcohol','baking soda','lemon juice'];
export const TIMELINE = { body_visible_weeks: '8-12', body_stable_months: '3-6' };
export const DISCLAIMER = 'For information only. For medical advice or diagnosis, consult a professional.';
```
