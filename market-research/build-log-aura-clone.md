# Build Log — GlowScore V1 "clone Aura" (femme)

Session du 2026-06-10. État du code après la passe de copie du funnel Aura à 80-90%. Réfs: [[gemini-deep-research-personas-femmes.md]], [[roadmap.md]], [[10-agent-review-backlog.md]]. Code dans `D:\Documents\APP\GlowUpAI\expo-app` + `CloudflareWorker`. Screenshots concurrents: `C:\Users\tirakninepeiijub\Documents\APP GLOW UP`.

## Décision stratégique lockée
100% FEMME, positionnement "Clinical & Aesthetic Diagnostics". Persona lead = F2 Optimisatrice data-driven 18-28. Feature héros = diagnostic radar + tracker d'évolution. Variable changée vs concurrents = la boucle fermée scan → plan → re-scan → delta. Modèle copié = funnel Aura (quiz long rose → scan → métriques "??/100" floutées → hard paywall "Unlock Your Glow Up" + invite 3 friends → plan de treatments locké).

## CE QUI A ÉTÉ FAIT (compile sans erreur, app + worker tsc CLEAN)

### Worker — `CloudflareWorker/src/index.ts`
- Rubrique vision LLM (`callVisionLLM`) étendue: + 4 proportions Aura (`eye_spacing`, `nose_lip_ratio`, `jawline_angle`, `forehead_proportion`) + 3 `treatments` `{name, detail, impact}`.
- `max_tokens` 400 → 700.
- Sanitization de sortie: clamp + fallbacks (dérive les nouvelles métriques des classiques si absentes) + treatments slicés/clampés.
- Garde-fous conservés: `overall` plancher 55, `potential` ≥ overall+3, temperature 0.
- ⚠️ PAS ENCORE DÉPLOYÉ. `wrangler deploy` requis pour activer les vraies métriques. L'app marche déjà avec l'ancien worker grâce au fallback client.

### Service scan — `expo-app/src/services/faceScan.ts`
- Interface `GlowScore` étendue (+ proportions + `Treatment[]`).
- `normalizeScore()`: remplit les champs Aura si le worker déployé est l'ancien (dérivations déterministes), dérive treatments depuis tips si absents.
- Mock web mis à jour (score 72 + 4 proportions + 3 treatments d'exemple).

### Nouveaux services
- `expo-app/src/services/inviteUnlock.ts`: pattern "inviter 3 amis" (Umax/Aura). Compteur de partages via Share sheet, déblocage à 3 (`INVITES_REQUIRED`), persisté AsyncStorage. Client-side MVP (réinstall = reset, attribution serveur plus tard).
- `expo-app/src/services/quizProfile.ts`: stocke les réponses du quiz (glowUpType, goals, outcomes, sleep, diet, workouts). Pas de PII.

### Onboarding — `expo-app/app/onboarding.tsx` (RÉÉCRIT)
Quiz 6 étapes, palette rose clair Aura:
0. Hook "Ready For Glow Up?" + carte features
1. "Pick Your Glow Up" (Surgical / Non-Surgical / Makeup) — copie Aura exacte
2. Objectifs (multi-select: peau, harmonie, yeux, jawline, lèvres, cheveux)
3. Désirs/outcomes (Look great in photos, Get noticed, Feel proud... — copie Mogged)
4. Daily basics (sommeil / diet / workouts — copie Mogged)
5. Permission caméra
Barre de progression haut, réponses sauvées via quizProfile. **Page pricing SORTIE de l'onboarding** (P0 backlog réglé).

### Scan result — `expo-app/app/scan-result.tsx` (RÉÉCRIT)
Reveal locké Aura, carousel 2 pages + flèches:
- Page 1 "Your Facial Harmony": photo + **??/100 rose** (ou vrai score si débloqué) + 5 cartes métriques (Facial Symmetry, Eye Spacing, Nose-to-Lip Ratio, Jawline Angle, Forehead Proportion) avec cadenas + barres grises partielles.
- Page 2 "Your Glow Up Plan": Treatment 1/2/3 lockés + barres Impact + ✨.
- Bas: "Unlock Your Glow Up" + "or invite 3 friends (n/3)".
- Débloqué (abo OU 3 invites): vrais scores, treatments, delta "+X since last scan", CTA "See Your Maxed-Out Self", "Share my results".
- Rétention câblée: saveScan, savePlanFromTips(treatments), scheduleRescanReminder.

### Pricing — `expo-app/app/pricing.tsx` (RÉÉCRIT)
Rose Aura. **"Start Free Instead" SUPPRIMÉ** (remplacé par croix discrète). Annual en premier "BEST VALUE 🔥" ($59.99/an, Save 91%), Weekly ($12.99 trial 3j), Lifetime ($39.99). Social proof "Join 10,000+ members". Conformité Apple gardée (3 tiers visibles, Restore, Terms/Privacy, auto-renew). CTA "Unlock Your Glow Up".

### Config
- `expo-app/tsconfig.json`: ajout `module: esnext` + `moduleResolution: bundler` (fix erreurs TS1323 préexistantes sur dynamic imports).

### Vérif visuelle
- `expo-app/web-preview/screenshot_check.py`: Playwright (Chrome système) capture les 3 écrans clés. Relançable. Screenshots validés conformes à Aura (scan locké, pricing, onboarding).
- Serveur testé: `npx expo start --web --port 8081` → http://localhost:8081, mock web (score 72).

## CONFORMITÉ APPLE — écran de consentement IA AJOUTÉ (2026-06-10)
Seul bloqueur de code restant pour la soumission, désormais traité:
- `expo-app/src/services/aiConsent.ts` (NEW): hasAiConsent / setAiConsent (AsyncStorage, clé `ai_consent_granted`).
- `onboarding.tsx`: nouvelle étape 5 "How your scan works" (opt-in explicite, 3 garanties + lien Privacy), CTA "I Agree & Continue" → setAiConsent. Caméra passe en étape 6, TOTAL_STEPS 6→7.
- `scan-result.tsx`: garde-fou — avant tout faceScan, si pas de consentement → écran "Analyze your photo with AI?" (I Agree / Not now / Privacy). Belt-and-suspenders pour le chemin library-pick.
- Vérifié visuellement (Playwright) + tsc CLEAN. Rappel archi: AUCUNE clé IA dans l'app; LLM_API_KEY/FAL_API_KEY = secrets du Worker (`wrangler secret put`).

Note métadonnées (`AppStore/metadata.md`): encore l'ancien positionnement GlowUp générique (pricing $4.99/$29.99, subtitle 31 char > 30, rating 12+). À RÉÉCRIRE pour le positionnement femme "Facial Harmony" + aligner pricing $12.99/$59.99. = contenu, pas code.

## RESTE À FAIRE (priorisé)

### Avant de tester sur device
1. `wrangler deploy` du worker (sinon métriques/treatments dérivés du fallback).
2. Tester funnel complet device: quiz → consentement → selfie → reveal locké → paywall / invites.

### Cohérence visuelle (V1.1)
3. Re-thème rose du **home** (onglet caméra, encore sombre) — entre quiz et scan.
4. Re-thème history / settings / feature-hub (encore sombres).

### Leviers de conversion (cf. Gemini, roadmap P1)
5. **Animation de scan "vecteurs + jauge 99%"** 7-10s avant le reveal (gros levier, peu coûteux).
6. **A/B: Maxed-Out Self AVANT le paywall** (choc visuel = déclencheur F1) vs verrouillé (V1 actuelle).
7. **Blueprint 12 semaines granulaire** (3 treatments → protocole prescriptif; anti-remboursement).
8. Allonger le quiz vers 15-25 écrans (les concurrents en ont beaucoup plus → plus d'investissement émotionnel).

### Roadmap features (séparé, cf. roadmap.md)
- Skin Scanner (note acné/rides/pores + tracker + routine + affiliation) = priorité haute v1.1/v2, colle au persona F4.
- Colorimétrie / Color Season (viral, trou de Glam Up).
- Web-to-App funnel (modèle Cal AI) après validation IAP.
- Export vidéo before/after 9:16 (munition UGC).
- Percentile server-side, usage enforcement serveur, share image natif réparé.

## Dette / points d'attention
- inviteUnlock = client-side (bypassable, reset au réinstall).
- usageMeter = client-only.
- analytics = console-only (Firebase commenté).
- RevenueCat fail-open dans le worker (`validateSubscriber`) = risque coût, décision fail-closed à trancher (P0 backlog).
- One-liner Gemini "ton 10/10 objectif" contredit le plancher anti-dysmorphie → préférer framing "potentiel".
- Copie ad "revenge" à reformuler en empowerment avant TikTok.

## Git
expo-app a son propre repo (4 commits, gros du travail GlowScore non commité). Racine GlowUpAI sans git. Rien commité cette session.
