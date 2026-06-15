# GlowScore - Blueprint "meilleure app" (synthèse revue 10 agents, 2026-06-15)

Synthèse orchestrée de 10 agents (onboarding, IA/navigation, Studio, scan, design/inclusivité, positionnement, rétention/monétisation, simplification, concurrence, ergonomie). Style: pas de tirets cadratins.

## Le socle (consensus)
- **Promesse de marque (1 ligne):** "See your glow, love your skin, at every size and every stage."
- **Définition (1 phrase):** GlowScore scanne le selfie d'une femme, score son harmonie faciale, et transforme les points faibles en plan glow-up quotidien + aperçus IA avant/après de son potentiel.
- **Boucle coeur:** selfie scan -> score + top 3 à travailler -> plan quotidien + 1 "wow" IA -> re-scan pour voir la progression. **C'est le moat que Aura ne peut pas copier (pas de re-scan).**
- **Positionnement:** app pour **les femmes en général**, avec une **valeur forte sur la niche plus-size** (représentée, aimée, besoins de confort couverts). Le plus-size est une **chaleur ressentie, pas le cadre**. Persona-gated, jamais le thème par défaut.

## Top problèmes (consensus inter-agents)
1. **6 onglets dont "Body"** = sur-indexation plus-size + Studio/Body en double. [P0]
2. **Paywall avant la valeur** (liste de features froide, pas le score/avant-après). [P0]
3. **Onboarding trop long avant le "wow"** (7 étapes avant le moindre score). [P0]
4. **Studio sans garantie d'avant/après** (seuls 2 outils passent par le slider result; les autres dead-end). [P0]
5. **Pas de retour/X partagé** sur les sous-pages (dead ends, surtout web). [P0]
6. **Plus-size en thème par défaut** ("Glow at any size" hero, "Chafing, folds") au lieu de persona-gated + imagerie inclusive. [P0/P1]
7. **Scan 1 photo, aucune garde qualité** (photo floue/sombre = score poubelle, scan gâché). [P0/P1]
8. **Boucle quotidienne statique** (mêmes 5 tâches; pas de "focus du jour"; pas de delta GlowScore visible). [P1]
9. **Invite-3-amies** = honteux pour cette audience + cannibalise le paywall. [P1]
10. **Pas d'affordance (i)** sur goals/métriques (le score juge au lieu d'enseigner). [P1]
11. **Beige hors-système** sur le résultat (casse le rose clinical-luxe). [P2]
12. **Studio dupliqué** (feature-hub vs (tabs)/studio). [P2]

## Moats à posséder (concurrence)
1. Boucle fermée scan -> plan -> re-scan avec **delta visible** (Aura grade une fois, lock; nous montrons l'évolution).
2. **Plus-size love + vrai body care** (intertrigo, chub rub, hyperpigmentation friction, vergetures confort) avec ton inclusif non-élitiste. Whitespace réel.
3. **De-bloat/cortisol 5 min** + **Color Season** (déjà fonctionnels, forte demande de recherche). Toujours "résilience/éclat", jamais poids.

## À copier 1:1 (funnel prouvé)
- Quiz désirs/goals AVANT le scan (le persona pilote home + plan), puis scan, puis **score flouté gated par paywall**.
- Cartes goals titre + sous-titre + Continue (style Mogged) + modal (i).
- Hard paywall, score flouté jusqu'au paiement (pas de free tier qui dévalue).

---

## EXÉCUTÉ cette session (tsc + export web OK)
- **5 onglets** (Body retiré du bar, route gardée href:null). [#1]
- **Home réparé**: passé en ScrollView (scroll OK), **persona-aware** (tagline "Glow at any size" + rangée Body Care seulement si goal body_glow), CTA simplifiés à **un seul** primaire vers le scan, plus de blocage permission caméra sur le home, copy "Chafing, folds" -> "Skin comfort & barrier care". [#6, ergonomie]
- **Studio curé** à 7 tuiles (Glow Up Styles en 1er; retiré Headshot, body care, round-face, visual-weight, chrono, posture, age; routes conservées). Capture **caméra + galerie**. [#4 partiel, #12 partiel]
- **Scan multi-angle guidé** (`app/multi-scan.tsx`): 3 angles (face, 3/4 G, 3/4 D), cross-platform stills (pas de mesh live), badge confiance, fallback 1 photo. `faceScan` + `scan-result` câblés pour exploiter les angles. [#7 partiel]
- **ScreenHeader** partagé créé (retour 1-tap, safe-area) + utilisé dans multi-scan. [#5 démarré]

## RESTE À FAIRE (séquencé, par impact)
P0:
- **Paywall après le reveal** (montrer score + avant/après Max Glow-Up + plan flouté, PUIS prix). [retention/onboarding]
- **Onboarding scan-first / compressé**: réduire à ~3 écrans, couper l'étape "Outcomes", sortir Surgical/Botox de l'étape 1, remonter "body comfort" en goal de 1er rang (pas position 8). [onboarding]
- **Router TOUS les outils Studio par `result.tsx`** (slider avant/après garanti) + **fix Clear Skin**. [Studio]
- **ScreenHeader sur toutes les sous-pages** + X explicite sur scan-result. [nav]
- **Garde qualité photo** (visage détecté + luminosité + flou) avant upload. [scan]

P1:
- **Imagerie inclusive**: re-caster home + onboarding pour qu'une femme plus-size apparaisse, éclairée luxe, dans des cadres women-general (jamais en "concern"). [design]
- **Boucle quotidienne dynamique**: "focus du jour" qui tourne + delta GlowScore sur le plan. [retention]
- **Invite-3 -> récompense douce optionnelle** (ou retrait). [retention]
- **Modal (i) InfoSheet** sur goals + métriques (quoi/pourquoi/comment). [ergonomie]
- **De-dupe Studio** (feature-hub canonique). [IA]
- Multi-angle: pondérer symétrie/jawline/nez depuis les 3/4 côté Worker. [scan]

P2:
- **Beige -> rose** (résultat aligné cream/blush). [design]
- Couper définitivement les ~6 legacy cachés (ou les garder cachés, déjà décidé). 

## Garde-fous (inchangés)
100% femmes, jamais poids/IMC/calories/GLP-1 reco/shame; hard paywall; Apple-safe; pas de tirets cadratins.
