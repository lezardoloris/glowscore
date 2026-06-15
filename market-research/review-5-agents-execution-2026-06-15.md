# Review 5 agents — travail exécuté (EPIC 17-25) + étude Stress-Faciomètre

Date: 2026-06-15. Revue du code réellement implémenté (home premium, glow-plan par persona, Stress-Faciomètre, vraie transfo Gemini, générateur de plan) + [PERSONA-PRODUCT-PLAN.md](../PERSONA-PRODUCT-PLAN.md) (EPIC 25) + [etude-differenciation-stress-faciometre-2026-06.md](etude-differenciation-stress-faciometre-2026-06.md). 5 angles. Style: pas de tirets cadratins.

## Angles + verdicts
1. Conformité Apple / anti-dysmorphie / claims médicales.
2. UX / design polish.
3. Correction du code / edge cases / coût IA.
4. Conversion / monétisation / viralité.
5. Fit persona / complétude produit.

## Corrections APPLIQUÉES (ce passage)
**Bugs / code (agent 3)**
- `stress-scan.tsx`: l'auto-animation du slider est désormais sans conflit (timers OK), et `runProjection` jette une erreur si `image_url` vide (plus d'écran before/after blanc).
- `glowPlan.ts`: ids de tâches anti-collision (`Date.now-i-rand`), liste cappée à 12 tâches, dedup conservée.

**Conformité (agent 1)**
- `stress-scan.tsx`: disclaimer consentement + non-médical ajouté sur l'écran index ("photo traitée par IA puis supprimée, visualisation bien-être, pas un avis médical"); copy reformulée "temporary and reversible"; index présenté comme état réversible (calculé à partir de sommeil/sodium/cycle, pas du visage).
- `index.tsx` (home): "clinical-grade" → "AI-powered" (claim adouci).

**UX (agent 2)**
- `stress-scan.tsx`: zones de congestion recolorées en rose on-brand (fini le bleu froid), repositionnées, copy "Highlighted areas"; knob du slider en chevrons Ionicons (fini le glyphe `◀ ▶`); disclaimer fontSize 10→11 (lisibilité).

**Conversion / growth (agent 4)**
- `stress-scan.tsx`: partage = vraie carte image before/after via `generateShareImage` (asset d'acquisition n°1), fallback texte; paywall contextuel (`/pricing?source=destress`).
- `index.tsx`: entrée "Check your cortisol face" sur le home (le hero était introuvable depuis l'accueil).

**Persona (agent 5)**
- `glowPlan.ts`: `FOCUS_TASKS.color` enrichi (6 tâches concrètes pré-feature pour P2), ajout des blocs `corporate` (P3) et `cortisol` (de-bloat), labels persona associés.
- `stress-scan.tsx` + `glowPlan.ts`: la routine de-bloat persiste un plan (`saveDestressPlan`, merge sans écraser le plan persona) → le hero feature alimente la rétention quotidienne.

## DIFFÉRÉ (noté, hors de ce passage autonome)
- **Server-side entitlement (agent 3, critique COGS/sécurité):** `glow_max`/`destress` passent en quality standard (limite IP 5/jour) et le paywall est client-side donc contournable. Fix propre = enforcement d'entitlement côté Worker (casse le test web local tant que RevenueCat n'est pas câblé). Reste un P0 worker-hardening déjà documenté (EPIC 21 / backlog worker).
- **Teaser flouté avant paywall (agent 4):** générer une projection de-puff basse résolution/floutée avant le gate (pattern reveal). Demande un appel IA supplémentaire + coût; à faire au build du funnel.
- **Carte image partageable sur le streak glow-plan (agent 4)** + reminder matin/upsell AR en fin de routine: nice-to-have rétention.
- **Safe-area insets (agent 2):** remplacer les paddingTop codés en dur par `useSafeAreaInsets` (régression device-wide mineure).
- **P2 Color routing (agent 5):** aucun signal colorimétrie dans l'onboarding actuel → P2 retombe sur skin. À régler avec EPIC 18 (Color Season) + une question d'onboarding.
- **Score /100 "Facial Harmony" (agent 1):** l'agent conformité recommande de retirer le score chiffré; conservé volontairement (décision produit verrouillée = clone Aura à 80%). Garde-fous: plancher 55, framing potentiel, cadrage bien-être. À ré-arbitrer si rejet Apple.

## Verdict global
Le travail exécuté est cohérent et tsc-clean. Les corrections P0 codeables (bugs, conformité de surface, growth hooks, persona library) sont appliquées. Les éléments différés sont des chantiers de build/déploiement (entitlement serveur, funnel de partage avancé, colorimétrie) déjà tracés dans le plan.
