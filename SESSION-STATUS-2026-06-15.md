# GlowScore — État de session & reprise (2026-06-15)

Pas de shutdown (la machine s'était mise en veille). Voici tout ce qui a été fait cette session et comment reprendre. Style: pas de tirets cadratins.

## Fait cette session (tout tsc clean, NON commité)

### 1. Vraie transformation Gemini Nano Banana testable en local (web)
- `expo-app/src/services/transform.ts`: sur web, vrai appel Worker quand `WORKER_BASE_URL` ≠ placeholder (helper canvas → jpeg base64). Avant: simulé (before == after).
- Setup: `cd CloudflareWorker && npx wrangler dev --port 8787` (lit `.dev.vars` avec la clé Gemini ATLAS) + `expo-app/.env` `WORKER_BASE_URL=http://localhost:8787` (les 2 gitignored).
- Vérifié bout-en-bout: navigateur → worker → Gemini → R2 → `/result`, before/after diffère enfin (rendu glow-up réel, identité préservée).

### 2. Fix troncatures
- Reveal `scan-result.tsx`: largeur déterministe `Platform.OS==='web' ? min(window,440) : window`.
- Barre d'onglets `(tabs)/_layout.tsx`: hauteur web 78 + paddingBottom 16 → labels Scan/Progress/Settings plus coupés.

### 3. UI premium + logo
- Home `(tabs)/index.tsx`: logo wordmark transparent (`assets/logo/logo_wordmark_t.png`, généré sans fond), ring de score (AnimatedCircularProgress), CTA dégradé, entrée "Check your cortisol face", "Top X%".
- Page de chargement `src/components/ProcessingAnimation.tsx`: anneau de progression autour de la photo + ligne de scan rose (fini le violet hors-charte).
- Glow-plan `app/glow-plan.tsx`: refait premium, **par persona + score**, groupé par catégorie (Skincare, Face Fitness, etc.), chips GlowScore/Week, stats done/streak.

### 4. Glow-up plan par persona + score
- `src/services/glowPlan.ts`: `buildPersonaTasks(quiz, score)` = foundation + focus primaire (goal) + secondaire (sous-score le plus faible) + capstone selon bande de score. Blocs: skin, jawline, eyes, harmony, lips, hair, makeup, color, corporate, cortisol. Cappé à 12 tâches.
- `scan-result.tsx` appelle `savePlanForProfile(quiz, score)`.

### 5. Différenciateur HERO: Stress-Faciomètre (Cortisol Face)
- Étude: `market-research/etude-differenciation-stress-faciometre-2026-06.md` (18 tendances TikTok/IG, scoring, hero 8,65/10, plan de test 2 sem, 3 concepts vidéos, anti-tendances).
- EPIC 25 ajouté à `PERSONA-PRODUCT-PLAN.md`.
- Écran `app/stress-scan.tsx`: diagnostic (3 questions) → Stress & Bloat Index /10 + zones roses → projection IA before/after → routine lymphatique guidée 8 min. Cadrage bien-être strict, disclaimers consentement + non-médical, partage carte image.
- Worker `CloudflareWorker/src/index.ts`: style `destress` + `GEMINI_PROMPTS.destress` (de-puff identity-preserving), routé via `/api/transform`. Routage vérifié (429 = rate-limit IP, pas 400).
- Entrées: home + feature-hub.

### 6. Recherche & reviews archivées (market-research/)
- `gemini-deep-research-rapport-strategique-2026-06.md` (8 personas, WTP, ASO, Cal AI).
- `prompt-differenciation-tiktok-trend.md` (prompt utilisé).
- `review-10-agents-persona-product-plan-2026-06-14.md` (revue du plan, moy 5,9/10).
- `review-5-agents-execution-2026-06-15.md` (revue du code exécuté; corrections P0 appliquées).

## Corrections de review appliquées
Bugs (slider auto-anim, image_url vide, id collision, cap 12), conformité (disclaimers consentement/non-médical, "clinical-grade"→"AI-powered", index présenté comme réversible), UX (zones roses repositionnées, knob chevrons, lisibilité), growth (partage carte image before/after, paywall contextuel `?source=destress`, entrée home), persona (color enrichi, blocs corporate+cortisol, routine de-bloat qui persiste un plan via `saveDestressPlan`).

## DIFFÉRÉ (à faire plus tard, par décision user)
- **Worker server-side entitlement** (glow_max/destress passent en limite IP standard, paywall client contournable). P0 hardening avant prod.
- Teaser flouté de la projection avant paywall (pattern reveal).
- Colorimétrie / Color Season (EPIC 18) + question d'onboarding pour router P2 (sinon P2 retombe sur skin).
- Safe-area insets (paddingTop codés en dur).
- Carte image partageable sur le streak glow-plan, reminder matin/upsell AR fin de routine.
- AR live massage (vision-camera + FaceMesh) pour 25.4.
- Décisions stratégiques à trancher: persona lead officiel (Glass Skin #1 vs Optimisatrice), forum communautaire (CUT v1 recommandé), Web-to-App Stripe.

## Reprendre le dev local
```
# Terminal 1 (worker, vraie transfo Gemini)
cd "d:/Documents/APP/GlowUpAI/CloudflareWorker" && npx wrangler dev --port 8787
# Terminal 2 (app web, lit .env -> worker local)
cd "d:/Documents/APP/GlowUpAI/expo-app" && npx expo start --web --port 8081
# tsc
cd "d:/Documents/APP/GlowUpAI/expo-app" && npx tsc --noEmit
```
Dev web: premium ON (override `dev_premium`), console `/admin`. Repo: `lezardoloris/glowscore` (rien n'est commité ce passage).

## Reste manuel (déploiement, inchangé)
Compte Apple Dev, `wrangler deploy` + secrets (FAL/LLM/REVENUECAT/GEMINI/SIGNING/APP_TOKEN), RevenueCat sans trial, vraies clés app.config/eas, pages légales, App Store Connect, eas build/submit.
