# GlowScore — Plan Epic & Stories

Date 2026-06-11. Plan d'exécution pour passer du "playground GlowUp AI 19 features" à une **app féminine clinique-luxe focalisée, en hard paywall**. Réfs: [[market-research/review-cro-multiagents-2026-06-10.md]], [[market-research/diagnostic-composants-visage.md]], [[market-research/github-toolkit.md]], audit features 2026-06-11.

---

## 🎯 North Star (décisions verrouillées)
1. **Hard paywall. Pas de free tier, pas de free trial.** On ne dévoile aucun résultat (score, composants, transfos) sans abonnement actif. Le scan tourne, le reveal est teasé/flouté, puis paywall. (Modèle Umax/Cal-AI : l'achat vient d'un user émotionnellement investi par le reveal.)
2. **Suite cohérente face/beauté féminine.** On garde uniquement les outils qui servent le glow-up du visage. On coupe le reste.
3. **Marque clinique-luxe rose, partout.** Plus aucun écran sombre, plus d'emojis-jouets.
4. **La boucle = le moat.** Scan → score → plan → re-scan → progression. Tout le reste sert cette boucle.

### Suite finale (GARDER) — toutes premium
Facial Harmony Scan (héros) · Maxed-Out Self (before/after) · Skin Glow · Hair Makeover · Makeup (vraie IA) · Relight · AI Headshot · Age Rewind · Fit Version.

### À COUPER (incohérent / mock / théâtre)
Art Style · Face Swap · Pet Portrait · Caricature · Couple Glow Up · Talking Photo · Animate Portrait · Background Removal · 4K Upscale · Try-On (vêtements) · Beauty Filter (mock) · hd-compare (fausses images) · Video export (stub).

---

## EPIC 1 — Monétisation hard paywall (P0)
**Goal:** zéro accès gratuit aux résultats ; conversion maximale au pic émotionnel.

- **1.1 Retirer le free trial** — En tant qu'utilisatrice, je paie immédiatement à l'unlock (pas d'essai 3 jours). *AC:* `pricing.tsx` ne dit plus "free trial" ; CTA "Unlock Your Glow Up" ; offering RevenueCat sans intro trial. *Files:* `pricing.tsx`, RevenueCat dashboard. *S · P0*
- **1.2 Hard-gate tous les résultats** — Aucun score/composant/treatment/transfo visible sans entitlement. *AC:* sans premium, le reveal reste floutté + paywall ; aucune transfo ne s'affiche. *Files:* `scan-result.tsx`, `featureService.ts`, `transform.ts`. *M · P0*
- **1.3 Décision invite-3-friends** — Choix : (A) le retirer (paywall pur, défaut) ou (B) le garder comme seul levier viral non-payant (modèle Umax) derrière un flag remote. *AC:* décision actée ; si retiré, plus de chemin gratuit dans `scan-result`. *Files:* `inviteUnlock.ts`, `scan-result.tsx`. *S · P0*
- **1.4 Supprimer le free-tier technique** — Retirer `transformPreview` (resize non-transformé), le `usageMeter` "5 gratuits/jour", le "Start Free Instead" résiduel. *AC:* toute transfo = réelle (premium) ; plus de preview bidon (cause racine du before==after). *Files:* `transform.ts`, `usageMeter.ts`, `result.tsx`, `onboarding.tsx`. *M · P0*
- **1.5 Paywall au bon moment** — Le paywall surgit juste après le reveal teasé (déjà en place), durci. *AC:* parcours quiz → scan → reveal locké → paywall, sans échappatoire gratuite. *S · P0*

## EPIC 2 — Élagage & cohérence du catalogue (P0)
**Goal:** ne garder que la suite face/beauté féminine.

- **2.1 Couper les features hors-marque** — Supprimer écrans + routes + entrées hub : art-style/instant-style, face-swap, pet-portrait, caricature, couple-glowup, talking-photo, animate-portrait, background-removal, upscale, try-on, beauty-filter, hd-compare, video-result. *AC:* routes injoignables ; `_layout.tsx` nettoyé ; fichiers archivés/supprimés. *Files:* `app/*.tsx`, `app/_layout.tsx`, `feature-hub.tsx`. *M · P0*
- **2.2 Rebrand le hub en "Glow-Up Studio"** — Le hub liste les 8 outils gardés, avec vignettes générées (assets/components, feat_*), zéro emoji, badges cohérents. *AC:* hub = 8 cartes on-brand rose. *Files:* `feature-hub.tsx`. *M · P0*
- **2.3 Nettoyer le Worker** — `/api/features` ne renvoie que la suite gardée ; presets inutilisés retirés ou ignorés. *AC:* liste features alignée. *Files:* `CloudflareWorker/src/index.ts`. *S · P1*

## EPIC 3 — Cohérence de marque (rose clinique-luxe) (P0)
**Goal:** aucun écran sombre, iconographie unifiée.

- **3.1 Re-thème des écrans gardés** — `processing`, `feature-hub`, `history`, et les écrans des 8 outils (hair-change, relight, headshot, age-transform, fitness-transform, virtual-makeup, styles) passent sur `theme.ts`. *AC:* plus de `#000` ; tokens partout. *Files:* ces `app/*.tsx`. *L · P0*
- **3.2 Iconographie** — Remplacer emojis par Ionicons + vignettes générées. *AC:* cohérence visuelle. *M · P1*
- **3.3 Appliquer le logo** — Mark dans les en-têtes, icône d'app (fait), splash. *AC:* logo visible et cohérent. *S · P1*

## EPIC 4 — Rendre les outils gardés réels & qualitatifs (P0/P1)
**Goal:** chaque outil premium tient sa promesse.

- **4.1 Toutes les transfos réelles** — Supprimé le preview ; before/after montre une vraie transformation HD. *AC:* le slider révèle un vrai changement. *Files:* `transform.ts`, `result.tsx`. *S · P0* (slider déjà réparé)
- **4.2 Makeup réel** — Remplacer le mock (rectangles colorés) par un endpoint IA maquillage (fal makeup / face-retouch). *AC:* le maquillage s'applique réellement et "Save" sauve le résultat. *Files:* `virtual-makeup.tsx`, Worker. *M · P1*
- **4.3 Skin Glow réel + hook tracker** — clear_skin réel + base du suivi peau (sous-scores, courbe). *AC:* skin glow visible + score peau persisté. *Files:* `transform.ts`, `glowPlan.ts`, `history.ts`. *M · P1*
- **4.4 Maxed-Out Self AVANT le paywall (flouté)** — générer le glow_max au scan et le montrer flouté juste avant le paywall = levier conversion #1. *AC:* l'utilisatrice voit son "potentiel" flou → paywall. *Files:* `scan-result.tsx`, `transform.ts`, Worker. *L · P0*
- **4.5 Slider robuste** — (option) remplacer le PanResponder par `expo-image-compare`. *AC:* drag fluide device. *S · P2*

## EPIC 5 — Boucle de rétention & profondeur du plan (P1)
- **5.1 Blueprint 12 semaines** — treatments → protocole multi-semaines + delta par composant au re-scan. *AC:* plan structuré + "Skin Clarity +6 cette semaine". *Files:* `glowPlan.ts`, `glow-plan.tsx`, Worker. *L · P1*
- **5.2 History = timeline de scores** — brancher `history.tsx` sur `ScanRecord` (score + delta + date), pas l'ancien TransformationRecord. *AC:* courbe de progression. *Files:* `history.tsx`, `history.ts`. *M · P1*
- **5.3 Notifications perso** — rescan J+6, streak-at-risk. *AC:* push pertinents. *Files:* `notifications.ts`. *S · P2*

## EPIC 6 — Durcissement & conformité pré-lancement (P0/P1)
- **6.1 Worker** — URLs R2 signées HMAC + validation magic-byte + rate-limit KV + percentile server-side (ratios GoldenFace). *AC:* trous fermés. *Files:* Worker. *L · P0*
- **6.2 Conformité** — suppression compte (fait), consentement IA (fait), age gate 17+, subtitle ≤30 (fait), pages légales live. *AC:* checklist Apple OK. *M · P0*
- **6.3 Build** — plugin vision-camera (fait), `expo install --check` sur machine réseau, screenshots, EAS build/submit. *AC:* build soumis. *Files:* `app.json`, `eas.json`. *M · P1*

## EPIC 7 — Croissance (P2, après validation)
- **7.1 Galerie d'options par composant** — les 18 images prêtes, écran "tape un composant → 3 projections". *M · P2*
- **7.2 Persona-branching** — intention du quiz → scan + copie paywall. *S · P1*
- **7.3 Web-to-app** — landing + quiz + Stripe → RevenueCat (modèle Cal-AI). *L · P2*
- **7.4 Usine UGC** — Higgsfield + Claude, before/after, scheduling. *L · P2*
- **7.5 Scan caméra on-device** — vision-camera + face-detector (validation visage + mesh). *L · P2*

---

## Ordre d'exécution conseillé
**Sprint 1 (P0 cœur):** EPIC 1 (hard paywall, no trial) + EPIC 2 (élagage) + EPIC 3.1 (re-thème) → l'app devient cohérente, focalisée, monétisée.
**Sprint 2 (P0 conversion):** EPIC 4.4 (Maxed-Out avant paywall) + 4.1 + EPIC 6.1/6.2 (durcissement/conformité) → prête à soumettre.
**Sprint 3 (P1 rétention):** EPIC 5 (blueprint + timeline) + EPIC 4.2/4.3 (makeup/skin réels) + 7.2.
**Sprint 4 (P2 croissance):** EPIC 7.

## Décision ouverte (à trancher)
- **Story 1.3 invite-3-friends** : le garder (viral, modèle Umax) ou le couper (paywall pur) ? Défaut proposé : **couper** pour coller à "tout en paywall", quitte à le réactiver en A/B plus tard.
