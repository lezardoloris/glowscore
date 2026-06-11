# Glow-Up / Looksmax App — Plan de plan (angle + scope)

Date 2026-06-06. Lead locké: app looksmaxxing/glow-up B2C, reuse du moteur GlowUp AI (`D:\Documents\APP\GlowUpAI\expo-app`). Modèle: lazymaxxing iOS (hard paywall + before/after ads + UGC factory), cf [[viral-app-playbooks.md]]. Désir core = beauté/attractiveness (#1 convertisseur). Benchmark: Umax $500-700K/mo. UGC factory (Higgsfield+Claude) = en attente, pas encore.

## PILIER 1 — Angle

Segmentation du looksmaxxing par audience + ton:
- **A. Male maxxing (Umax-like)**: hommes, jawline/PSL/masculinity. Convert très fort MAIS saturé par Umax + ton incel = risque brand + Apple.
- **B. Female glow-up**: femmes, peau/glow/makeup. Brand-safe, moins saturé, fit GlowUp élevé.
- **C. Universal "Glow-Up Potential" (RECO)**: app gender-neutral "best self", créas UGC segmentées homme/femme pour tout le TAM. Peu saturé sur ce framing, fit GlowUp maximal.

**Thèse de différenciation (edge réel sur Umax):** Umax vend le DIAGNOSTIC (chiffre froid, démoralisant). Nous vendons DIAGNOSTIC + REMÈDE + PLAN: score → "ton toi maxé" en before/after → plan glow-up actionnable. Triple gagnant: plus éthique (moins de risque Apple/brand), plus viral (before/after de TOI se partage), plus de rétention (le plan fait revenir). Et c'est déjà ce que GlowUp fait.

**Rappel cadre (les 2 gurus):** ne PAS sur-différencier le produit ("creativity = enemy of first dollar"). Copier 90% de la structure prouvée. Diff = angle/audience + le reveal "potentiel" + DISTRIBUTION (usine UGC), pas des features uniques. Le moat est la machine d'acquisition, pas le produit.

## PILIER 2 — Ce qu'on peut build (carte assets GlowUp)

- **DÉJÀ fait (reuse)**: upload/camera, transfos glow-up (Clear Skin, Model Look, Hair Makeover, Age Rewind, Fit Version, virtual-makeup, headshot, hair-change, fitness-transform...), worker fal.ai, paywall RevenueCat, usageMeter, history, onboarding, processing/result, shareGenerator.
- **À BUILD — le héros**: module AI face scan → SCORE (overall, peau, jawline, symétrie, potentiel) + UI breakdown. Seul gros morceau neuf = le reveal viral.
- **À BUILD — la diff**: chaînage score → "potentiel glow-up" before/after (réutilise les transfos existantes), plan glow-up (LLM), export vidéo before/after (munition ads).

Conclusion: le côté transformation est DÉJÀ codé. Manque surtout le scoring/reveal en front. C'est le focus build.

## MVP v1 (scope)
1. Onboarding (reuse) framé insécurité/désir
2. Face scan → score reveal (NEW héros)
3. "Ton potentiel glow-up" before/after (reuse transfos + NEW chaînage)
4. Hard paywall avant reveal complet/HD (reuse RevenueCat, fix pricing)
5. Share/export before/after (reuse + NEW vidéo)
6. Plan glow-up (NEW, LLM) — possible v1.1

## Phases
- **Phase 0** — Audit assets + lock angle + choix méthode scoring (~0.5j)
- **Phase 1** — Build + valider face scan → score reveal (héros). Go/no-go = le reveal donne-t-il envie de partager.
- **Phase 2** — Chaîner score → potentiel glow-up before/after (reuse transfos)
- **Phase 3** — Paywall + pricing + onboarding insécurité
- **Phase 4** — Export vidéo before/after (munition ads)
- **Phase 5** — Soumission App Store (compte Apple Dev, légal, screenshots, eas build/submit)
- **Phase 6** — Usine UGC AI (Higgsfield+Claude) + lancement UA TikTok Smart+ $50/j USA

## Décisions à verrouiller (avant plan détaillé)
1. Angle: A / B / **C (reco)**
2. Reveal héros: score seul / potentiel seul / **combo (reco)**
3. Méthode scoring: modèle vision (attributs faciaux) vs heuristique + LLM pour le rationnel. À trancher Phase 1.
4. Nom/brand de l'app
5. Pricing: chiffres Will (**$12.99/sem + $59.99/an + retention $44.99**) vs $4.99 GlowUp actuel

## Risques / inconnues Phase 0-1
- Le scoring facial: faisabilité fal.ai/modèle vision pour sortir des scores crédibles + risque Apple (apps "beauty score" parfois rejetées pour body-image). Framing "artistic/entertainment" + positif obligatoire.
- Qualité du "potentiel glow-up" before/after (doit être flatteur mais crédible).
- Free tier: montrer un vrai reveal partiel vs hard paywall sec (le playbook Will = hard paywall).

## Structure du plan détaillé (livrable suivant)
Par phase: tâches ordonnées, fichiers exacts (chemins expo-app + worker), critères de done, dépendances, estimation. + plan UGC/UA séparé (formats before/after, perso Nano Banana, scheduling postbridge, TikTok Smart+).
