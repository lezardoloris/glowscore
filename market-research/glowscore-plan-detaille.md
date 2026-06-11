# GlowScore (Glow Up AI looksmax) — Plan détaillé d'exécution

Date 2026-06-06. Base: `D:\Documents\APP\GlowUpAI\expo-app` + `CloudflareWorker`. Décisions lockées: angle C (universal glow-up potential), reveal combo (score + potentiel before/after), iOS first, pricing Will ($12.99/sem + $59.99/an + retention $44.99), nom de travail "Glow Up AI" / feature héros "GlowScore". Réfs: [[glowup-looksmax-plan-de-plan.md]], [[viral-app-playbooks.md]].

## État audité (ce qui existe déjà)
- **Worker** (`CloudflareWorker/src/index.ts`, ~1714 lignes): ~17 endpoints fal.ai (`/api/transform` via `fal-ai/flux/dev`, face-swap, instant-style, headshot, hair-change, relight, age-transform, try-on, animate-portrait, talking-photo, bg-removal, caricature, photo-restore, pet-portrait, fitness-transform, upscale). Helpers propres: `checkRateLimit`, `callFalAi`, `cacheImageInR2`, `validateHdAuth`. STYLE_PRESETS serveur-side. **PAS d'endpoint scoring.**
- **App** (`expo-app/app/`): onboarding (3 écrans, soft paywall), (tabs) home, feature-hub, styles, processing, result (slider before/after OK), pricing, paywall (redirect→pricing), + ~25 écrans features.
- **Services** (`expo-app/src/services/`): transform, featureService (wrappers endpoints), subscription (RevenueCat complet), usageMeter, history, analytics, haptics, notifications, shareGenerator (image brandée), remoteStyles.
- **Config** (`src/config/index.ts`): product IDs ACTUELS `glowup_weekly_299/annual_1499/lifetime_3999` (= $2.99/$14.99/$39.99) → À CHANGER vers Will.
- **Indice**: onboarding.tsx ligne 186 liste déjà "Full GlowScore" → le nom feature est validé.

## Le seul vrai build neuf = GlowScore (face scan → score)
Tout le reste (transfos, before/after, share, paywall, rate-limit) existe. On bolt un module scoring devant.

---

## PHASE 0 — Lock technique (0.5j) [quasi fait]
- [ ] Choisir méthode scoring: **vision LLM** (multimodal renvoyant JSON scores + rationnel + tips) vs heuristique landmarks. Reco: vision LLM (rapide, flexible), rubrique fixe + température basse pour la consistance.
- [ ] Lock pricing IDs finaux (cf Phase 3).
- [ ] Vérifier secrets worker présents (FAL_API_KEY) + clé LLM vision à ajouter.
- Done: spec scoring écrite.

## PHASE 1 — GlowScore reveal (HÉROS, go/no-go) (~2-3j)
Le reveal viral. Si pas beau/partageable → stop.
- [ ] **Worker** `CloudflareWorker/src/index.ts`: nouvel endpoint `/api/face-scan` (+ route dans le switch). Appelle un modèle vision (fal.ai vision ou LLM multimodal) avec rubrique fixe → renvoie JSON: `{ overall, skin, jawline, symmetry, eyes, potential, percentile, rationale, tips[] }`. Framing POSITIF + entertainment (anti-rejet Apple). Réutilise `checkRateLimit` + `validateHdAuth` pattern. Free = 1 scan partiel, score complet = premium.
- [ ] **Service** `src/services/faceScan.ts` (NEW): wrapper `faceScan(imageUri, token)` calqué sur `uploadAndProcess` de featureService.ts.
- [ ] **Écran** `app/scan-result.tsx` (NEW): UI reveal — gros score animé (compteur), barres breakdown, percentile ("top 18%"), CTA "See your glow-up potential". Réutilise haptics + UsageBanner + le pattern auto-reveal de result.tsx.
- [ ] **Home flow** `app/(tabs)/index.tsx`: après capture photo → route vers scan (au lieu de / en plus de feature-hub).
- [ ] **Disclaimer**: réutiliser le texte "AI-generated artistic visualization / entertainment only" déjà dans result.tsx.
- Done/GO: sur 10 vrais selfies, le score est crédible, positif, et donne envie de partager.

## PHASE 2 — "Your Potential" before/after (~1-2j)
Le payoff différenciant vs Umax.
- [ ] **Worker**: ajouter un preset composite `glow_max` dans STYLE_PRESETS (skin clair + jawline + cheveux + lighting) — réutilise `/api/transform` existant, zéro nouvel endpoint.
- [ ] **Chaînage**: depuis `scan-result.tsx`, CTA "potentiel" → appelle transform(`glow_max`) → route vers `result.tsx` (slider before/after EXISTANT, zéro changement).
- [ ] Lier score → potentiel narrativement ("voici ton +2.1 points").
- Done: scan → score → "ton toi maxé" en before/after partageable.

## PHASE 3 — Hard paywall + pricing Will (~1-2j)
- [ ] `src/config/index.ts`: product IDs → `glowup_weekly_1299 / annual_5999`, garder lifetime option. ENTITLEMENT_ID inchangé.
- [ ] **RevenueCat dashboard** (manuel): offerings $12.99/sem (trial 3j) + $59.99/an + **retention offer $44.99/an** (montré uniquement à l'annulation, spec Will, sinon rejet Apple).
- [ ] **App Store Connect** (manuel): IAP correspondants + subscription group.
- [ ] **Hard paywall**: `app/onboarding.tsx` PricingScreen + flow scan: montrer score PARTIEL (overall flouté/locked) → paywall → reveal complet + potentiel. Réduire/retirer le "Start Free Instead" trop facile (garder un chemin légal minimal anti-rejet).
- [ ] Corriger le "free preview bidon" (featureService web mock OK, mais sur device le free doit montrer un vrai reveal partiel, pas l'image brute).
- Done: paywall dur testé en sandbox, pricing aligné partout.

## PHASE 4 — Export vidéo before/after (munition ads) (~2j)
- [ ] `src/services/videoExport.ts` (NEW) ou étendre shareGenerator.ts: générer une vidéo reveal slider-wipe (before→after) verticale 9:16. Option: lib RN (react-native-skia/ffmpeg) ou endpoint worker dédié.
- [ ] Bouton "Share as video" sur result.tsx + scan-result.tsx.
- Done: export .mp4 9:16 partageable = créa UA gratuite.

## PHASE 5 — Soumission App Store (~2-3j)
- [ ] Rebrand assets/icon/splash + métadonnées (réutiliser `AppStore/metadata.md`, ALIGNER le pricing).
- [ ] Pages légales privacy/terms en URL live (glowupai.app/...).
- [ ] Compte Apple Developer ($99) + certs + App ID `com.glowupai.app`.
- [ ] Screenshots 6.7"/6.1" (hero reveal + before/after + paywall).
- [ ] `eas build --platform ios` + `eas submit`. Suivre `APP-STORE-SUBMISSION-CHECKLIST.md` existant.
- Risque #1: rejet "face rating / body image". Mitigation: framing positif "potentiel/glow-up", disclaimer entertainment partout, jamais "tu es moche".
- Done: build soumis.

## PHASE 6 — Usine UGC AI + UA (en continu)
- [ ] Monter l'usine UGC (Higgsfield MCP + Claude, déjà connectés): perso Nano Banana → start image Seedance, format before/after, scheduling postbridge.
- [ ] TikTok Smart+ $50/jour USA, optimise purchase. 10-12 variants du gagnant.
- [ ] Cibles: CPI < $2, CTR > 1%, CPA < LTV (~$30+). Scale +30%/3j.
- [ ] Cheat codes: crédit TikTok $6k, Apple Small Business 15%.

---

## Risques / inconnues
- **Scoring crédible + Apple-safe** (Phase 1 = le vrai go/no-go).
- **Qualité du "potentiel glow_max"** (flatteur mais reconnaissable comme soi).
- **Rejet face-rating**: framing positif obligatoire.
- **Coût/latence par scan+potentiel** à l'échelle UA (2 appels fal/LLM par user).

## Estimation
Phases 1-4 (le build neuf) ~ 6-9 jours dev. Phase 5 ~ 2-3j (surtout admin Apple). Phase 6 = continu. Le gros est DÉJÀ codé; le delta réel = GlowScore + chaînage + hard paywall + vidéo.

## Démarrage exécution
Attaquer **Phase 1** (endpoint `/api/face-scan` + `scan-result.tsx`) car c'est le seul go/no-go. Tester sur vrais selfies avant tout le reste.
