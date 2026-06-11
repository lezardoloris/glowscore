# MidMod Room AI — Plan de plan (méta-structure)

Date: 2026-06-06. Objectif: app AI interior design angle Mid-Century Modern, forkée du moteur GlowUp AI (`D:\Documents\APP\GlowUpAI\expo-app`), tied à ohmidmod.com. Modèle cible: mobile B2C weekly-sub + paid UA (cf [[interior-design-market-teardown.md]], benchmark Home AI ~$1M/mo). Séquence demandée par user: plan de plan → plan détaillé → exécution.

## Philosophie
Fork pas rebuild. MVP rapide qui rend bien en MCM. Le revenu vient de la distribution (skill media buyer user), pas de la qualité render (commoditisée ~$0.05/img). Innover seulement sur le 10% que personne ne fait bien (shop-the-look SKU réel OhMidMod, vidéo before/after TikTok).

## Carte de réutilisation (GlowUp → MidMod)
- **Réutiliser tel quel**: `subscription.ts` (RevenueCat), `usageMeter`, `history`, `analytics`, `haptics`, `notifications`, paywall, onboarding, processing, result, GlassCard/UsageBanner, ErrorBoundary, config EAS, auth + rate-limit du Cloudflare Worker.
- **Remplacer**: `src/config/index.ts` STYLE_PRESETS (selfie → styles déco), prompt + endpoint modèle fal.ai dans `CloudflareWorker/src/index.ts` (visage → pièce), home `(tabs)/index.tsx` + `feature-hub.tsx`, `styles.tsx`, `shareGenerator.ts` (ajouter vidéo before/after), branding/assets/icon, AppStore metadata.
- **Ajouter**: sélecteur room-type, toggle préservation structure, composant shop-the-look + service catalogue OhMidMod, export vidéo before/after TikTok, estimation budget (post-MVP).

## 6 workstreams
1. Scope & décisions
2. Coeur AI (fal.ai interior + prompts MCM + préservation structure)
3. Reskin app (nav, écrans, styles, branding)
4. Couche commerce/viral (shop-the-look OhMidMod + vidéo before/after)
5. Monétisation (RevenueCat weekly + pricing)
6. Store + Distribution UA

## 6 phases (ordre du plan détaillé)
- **Phase 0** — Audit code expo-app + Worker, lock décisions. (~0.5j)
- **Phase 1** — Prouver le render MCM sur vraies photos de pièces AVANT de toucher l'app (test fal.ai modèles, prompts, structure preservation). Go/no-go sur la qualité.
- **Phase 2** — Reskin MVP iOS: upload → room type → style MCM → render → result. Réutilise tout le shell.
- **Phase 3** — Innovation: shop-the-look catalogue OhMidMod + export vidéo before/after.
- **Phase 4** — Monétisation + polish: paywall, pricing aligné, free tier qui montre un VRAI render basse-déf (corrige le bug GlowUp du preview bidon).
- **Phase 5** — Soumission App Store (compte Apple Dev, légal, screenshots, eas build/submit).
- **Phase 6** — Lancement UA (créas before/after Meta/TikTok, ASO).

## Décisions à verrouiller (défauts recommandés)
1. **Identité**: nouvelle app brandée, code forké. Défaut nom "MidMod AI" / "OhMidMod Studio".
2. **Styles**: MCM héros + multi-styles (Scandinavian, Japandi, Industrial, Boho). Single-style limite le TAM.
3. **Modèle fal.ai**: redesign préservation structure (ControlNet depth/seg + Flux/SDXL interior). Valider Phase 1.
4. **Shop-the-look**: catalogue OhMidMod curaté (SKUs MCM) + fallback visual search.
5. **Plateforme**: iOS d'abord, Android fast-follow.
6. **Pricing**: $4.99/sem (trial 3j) + $39.99/an + $99 lifetime.

## Risques / inconnues à résoudre Phase 0-1
- Qualité du render MCM structure-preserving sur fal.ai (le go/no-go réel).
- Source du catalogue OhMidMod (export produits Shopify → JSON SKU + images + prix + lien).
- Coût/latence par render à l'échelle UA.
- Free tier: vrai render basse-déf vs paywall sec (impact conversion + risque rejet App Store).

## Structure du plan détaillé (livrable suivant)
Pour chaque phase: tâches ordonnées, fichiers touchés (chemins exacts), critères de done, dépendances, estimation. Plus un plan UA séparé (angles créa before/after, ASO keywords, budget test).
