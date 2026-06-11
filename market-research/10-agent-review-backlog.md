# GlowScore — Revue 10 agents + backlog priorisé (2026-06-06)

10 agents (UX, design visuel, personas, monétisation, viralité, ASO/compliance, technique, qualité scoring AI, concurrence, rétention) ont audité le code réel + les docs. Les items signalés par PLUSIEURS agents = consensus = haute confiance.

## ✅ DÉJÀ CORRIGÉ dans cette passe (P0 sûrs)
1. **Pricing display** `pricing.tsx`: $2.99→$12.99/sem, $14.99→$59.99/an (+ "$1.15/week, Save 91%"). C'était une sous-facturation 4x (config IDs $12.99 mais UI affichait $2.99). Signalé par UX + Monétisation.
2. **Coût scan -75%** `faceScan.ts`: scan en 512px (PREVIEW_SIZE) au lieu de 1024 (HD_SIZE). Le vision LLM n'a pas besoin de 1024. Signalé par Technique.
3. **Cohérence scoring** worker `callVisionLLM`: temperature 0.3→0 (même photo = même score). Le bug #1 d'Umax. Signalé par Technique + AI Scoring.
4. **Anti-biais glow_max** worker: prompt + negative renforcés pour préserver teinte de peau / traits ethniques / forme du visage (évite le "skin lightening" sur sujets non-blancs). Signalé par AI Scoring.
5. **Mensonge "on-device"** `onboarding.tsx`: "photos never leave your phone" (FAUX, elles vont au worker) → "processed securely and is never stored". Risque rejet Apple + légal. Signalé par UX + ASO.

## 🔴 P0 — À FAIRE avant tout spend UA (consensus multi-agents)

**Sécurité / coût (Technique):**
- **RevenueCat fail-OPEN = bombe à coût.** `validateSubscriber` retourne `true` sur erreur/5xx → premium gratuit pour tous pendant 5 min (caché). DÉCISION: passer fail-closed (return false) vs garder fail-open pour ne pas punir les payeurs en cas de panne RC. Reco: fail-closed au lancement (risque coût > risque panne rare). `index.ts` ~1849-1868.
- **R2 public** : images (selfies scorés) servies sans auth, clé 8 hex (brute-forçable 32-bit). Passer à 16 hex + signed URL. `index.ts` handleServeImage.
- **Double appel fal.ai au retry** `processing.tsx:83-96` (retry sans garde = 2x coût). 
- Valider magic-byte JPEG/PNG avant l'appel LLM (évite payer un call sur du garbage).

**Monétisation (Monétisation + UX):**
- **Paywall trop tôt**: l'écran pricing est en onboarding AVANT le scan. Doit venir APRÈS le reveal (le score crée l'investissement émotionnel). Retirer la page pricing de l'onboarding, garder le gate sur "See Your Maxed-Out Self".
- **Free tier trop généreux**: 16/19 features gratuites. Gater Age Machine, Animate, Fitness, 4K Upscale, Couple en premium. `feature-hub.tsx` + `config`.
- **"Start Free Instead" trop visible** (bouton plein) → lien texte discret. `onboarding.tsx` + `pricing.tsx`.
- Vérifier trial 3j configuré dans RevenueCat (sinon "Try Free 3 Days" = mensonge + rejet).

**Rétention (Rétention) — LE plus gros risque LTV:**
- **GlowScore JAMAIS persisté** = app one-and-done = churn avant renouvellement semaine 1. `history.ts` ne stocke que les transforms. P0: ajouter `ScanRecord` + `saveScan()` appelé dans `scan-result.tsx`, afficher le delta "+3 depuis la semaine dernière". C'est la fondation de toute la rétention.

**Compliance (ASO) — bloquants soumission:**
- **Subtitle 31 chars > limite 30** (`metadata.md` "AI Photo Glow Up Transformation"). Bloquant technique.
- **Écran consentement AI** (règle Apple nov 2025): divulguer que la photo est traitée par un AI tiers + opt-in avant le 1er envoi.
- **Suppression de compte in-app** (exigé Apple depuis 2024).
- **Paywall**: 3 tiers visibles simultanément + auto-renew 16pt+ + Restore + Terms/Privacy (pricing.tsx a déjà Restore/Terms/auto-renew; ajouter les 3 tiers visibles + consentement).
- **Age rating** 12+ → 9+ Health/Wellness (aligne concurrents, retire le flag "suggestive").

**Sécurité psycho / framing (Personas) — haute importance vu la scrutiny média 2026:**
- **Lead avec persona FEMME glow-up** (aspirationnel), pas le PSL masculin (saturé Umax + scrutiny + risque Apple). Onboarding Q1 = genre/objectif → framing "potentiel" pour tous, jamais "rate my face".
- **Jamais de vocabulaire PSL/incel** dans l'app ou les ads.
- **Garde-fous BDD**: score jamais < ~55-60, age gate 17+, pas de leaderboard "vs autres", rate-limit re-scan (>5/24h = pause), lien ressource santé mentale (NEDA). Différenciant ET protection.

## 🟡 P1 — Avant/juste après soumission

**Viralité (Viralité) — le moteur de croissance est cassé:**
- **Share = texte seul.** Le branded image est cassé en natif (`shareGenerator` natif renvoie l'after brut), la vidéo est désactivée. Tout le modèle UA dépend du before/after partageable. P1: réparer le share image natif (react-native-view-shot ou endpoint worker), puis brancher la vidéo before/after (Higgsfield, cf videoExport option B).
- **Bouton Share au-dessus du fold**, juste sous le ring (pas en bas après scroll).
- Usine UGC: bank de 4 persos Nano Banana + factory Claude (cf viral-app-playbooks.md), virality_predictor avant publication.

**Design reveal (Design) — make-or-break du partage:**
- **Le ring est un bord plat, pas un arc** proportionnel au score → SVG arc (react-native-svg). #1 crédibilité visuelle.
- **Avatar 72px trop petit** → 200px+ avec ring glow.
- **Reveal séquencé** (avatar → ring sweep → count-up → barres en stagger → carte potentiel) au lieu de tout d'un coup.
- Barres animées 0→valeur; recolorer (le scoreColor met du jaune/orange "alarme" même sur bons scores).
- Composer pour le screenshot App Store (hero dans le 1er écran).

**Qualité AI (AI Scoring):**
- **Percentile confabulé** par le LLM (aucune base population) → calculer server-side `normalCDF(overall, 68, 12)` puis vrai empirique à 10k users.
- Rubrique calibrée (ancrer la distribution 40-100, forcer observation-avant-score, few-shot anchors) sinon tout score cluster 62-78.
- A/B test `gemini-flash` vs `gpt-4o-mini` (moins de refus sur tâches d'apparence). Pas Claude (refuse).
- Fallback si le LLM refuse/renvoie non-JSON.

**Rétention (Rétention):**
- Plan glow-up persistant = checklist quotidienne + streaks (`glowPlan.ts` + `glow-plan.tsx`).
- Notifications personnalisées (rescan J+6, streak-at-risk, plan check-in) au lieu du "style drop" générique.
- Carte "Before vs Now" partageable (UA organique).

## 🟢 P2 — Moat / scaling
- Body/Fitness GlowScore (Gymmaxing), Hair/Makeup try-on liés au plan, AI Coach chat (moat Overglow), challenges hebdo, leaderboard agrégé anonyme, milestones (#3/#7/#30 scans).
- Server-side usage enforcement (usageMeter est client-only, bypassable).

## Différenciation défendable (consensus Concurrence + Personas)
> "Umax te donne un chiffre. Nous te donnons un miroir de qui tu peux devenir, puis un chemin quotidien pour y arriver."
Boucle scan → before/after PHOTORÉALISTE de TON visage (pas un render stylisé) → plan perso → re-scan progression. Aucun concurrent ne ferme cette boucle. + framing gender-neutral Apple-safe ouvre le TAM féminin (50%+, ignoré par le top). + cohérence du score (temp 0) = trust signal vs Umax.

## Concurrents notables identifiés (à étudier)
Umax ($500-700K/mo, inconsistant), LooksMax AI/LooxUP (10M+ DL), **Mogged** (fait déjà le "maxed-out self" mais stylisé), **Overglow** (meilleure rétention: checklist+XP+coach), Handsome AI, UCHAD. Tous manquent le before/after photoréaliste + vidéo partageable.

## Décisions produit à trancher (forks)
1. RevenueCat fail-closed vs fail-open.
2. Lead persona: femme glow-up (reco) vs homme PSL vs neutre.
3. Paywall: retirer de l'onboarding (reco) ou garder + durcir.
4. Combien de features fork garder en hero vs cacher (reco: hero linéaire scan→score→potentiel, hub en secondaire).
