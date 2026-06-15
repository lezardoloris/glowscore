# GlowScore — Plan produit en profondeur par persona (EPIC 17-24)

Ancré sur `market-research/gemini-deep-research-rapport-strategique-2026-06.md` (+ [[gemini-deep-research-personas-femmes]]). Suite de `EPIC-PLAN.md` (EPIC 1-7) et `PREMIUM-PLAN.md` (EPIC 8-16). Objet: travailler l'app en profondeur produit selon nos personas prioritaires, en gardant le principe 80/20 (80% = funnel clone Aura déjà construit; 20% = profondeur produit + différenciation).

Style: pas de tirets cadratins. Chaque story = `[ID] Titre / user story / critères d'acceptation (AC) / notes IA-tech / réf`.

## Personas prioritaires (par valeur commerciale = Volume × WTP × Rétention × Viralité)
- **P1 Glass Skin Devotee** (~11M, WTP max, rétention excellente) → moteur de RÉTENTION (scan peau hebdo, 8-12 sem).
- **P2 Color Analysis Purist** (~14M, viralité TikTok/Pinterest +2200%) → moteur d'ACQUISITION organique.
- **P3 Corporate Ascender** (~8,5M, pouvoir d'achat autonome) → moteur de CONVERSION (hebdo 12,99$).
- Secondaires touchés: Pro-Aging (#6), Bridal (#4), Corrective Makeup (#8). Exclu acquisition payante: ado 13-17 (#7).

## Lecture rapide (mapping EPIC → persona → rôle funnel)
| EPIC | Thème | Persona lead | Rôle | Priorité |
|---|---|---|---|---|
| 17 | Skin Diagnostic Engine | P1 | Rétention + cœur onboarding | P0 |
| 18 | Color Season Studio | P2 | Acquisition organique (GAP) | P0 |
| 19 | Maxed-Out Self réaliste | tous | Engagement/surprise | P1 |
| 20 | Corporate & Style Image | P3 | Conversion | P1 |
| 21 | Apple-safe & anti-dysmorphie | tous | Conformité (bloquant store) | P0 |
| 22 | Onboarding valeur + confiance | tous | Conversion paywall | P0 |
| 23 | Rétention & communauté | P1 | Rétention LT | P1 |
| 24 | Acquisition & funnel | P2 | Croissance/marge | P1 |

---

## EPIC 17 — Skin Diagnostic Engine (P1 Glass Skin Devotee) [P0]
**Objectif:** faire du diagnostic dermatologique la pièce centrale de l'onboarding (justifie le hard paywall) ET la boucle de rétention hebdo. Réf: Pilier 1 (P1 valeur max), Pilier 2 (Face Maps Looksglo), Plan point 4.

- **[17.1] Scan peau clinique + Face Maps colorées.** En tant que Glass Skin Devotee, je veux voir l'emplacement exact de mes imperfections (acné, pores, taches, texture, rougeurs) sur une carte faciale colorée, pour prouver que ce n'est pas un filtre. AC: overlay multi-zones (≥5 catégories) sur le selfie; légende; export image. IA: vision LLM/segmentation par zone, sortie coordonnées → overlay. Réf: verbatim "cartes faciales colorées".
- **[17.2] Skin Health Score (cadrage clinique, non chiffré-défaut).** AC: score global + sous-scores (clarté, texture, uniformité, hydratation perçue, éclat) en langage bien-être, jamais "défauts"; plancher anti-dysmorphie. Réf: Plan point 1.
- **[17.3] Routine builder ordonnée AM/PM.** En tant qu'utilisatrice, je veux l'ORDRE d'application exact de mes produits pour ne plus gaspiller. AC: routine étape par étape, matin/soir, par type de peau; cases à cocher. Réf: verbatim "dans quel ordre appliquer".
- **[17.4] Re-scan hebdo + delta de progression.** AC: comparaison N vs N-1, courbe de clarté sur 8-12 sem, "+X% clarté"; rappel hebdo. IA: normaliser l'éclairage entre scans (voir 18.1). Réf: "constance est la clef".
- **[17.5] Skin streak + nudges.** AC: streak de scans/routine; notif "consistency is key"; badge à 4/8/12 sem.
- **[17.6] Guidance produits/ingrédients (affiliate-ready).** AC: recommandations d'actifs par problème (rétinol, niacinamide, SPF...) + slots produits taggables (liens affi US, conformes Apple redirect). Réf: WTP "investit déjà en skincare".

## EPIC 18 — Color Season Studio (P2 Color Analysis Purist) [P0] — GAP À COMBLER
**Objectif:** ajouter la colorimétrie (absente de la suite verrouillée) = #2 valeur + plus gros driver d'acquisition organique (+2200% Pinterest). Réf: Pilier 1 (P2), Pilier 3 (180k rech./mois), Plan point 2.

- **[18.1] Calibration dynamique de l'éclairage.** En tant que puriste colorimétrie, je veux un résultat stable d'un scan à l'autre. AC: étape d'étalonnage (photo feuille blanche OU cadrage zone du cou sans ombre); rejet si lumière insuffisante; white-balance normalisé. Réf: faille concurrente "instabilité selon l'éclairage", Plan point 2.
- **[18.2] Analyse 12 saisons + sous-saison.** AC: classification (hiver/été/printemps/automne + profondeur/clarté/chaleur); explication pédagogique. Réf: verbatim "été et ça explique mes choix".
- **[18.3] Palette personnelle extraite.** AC: 12-24 couleurs vêtements + neutres + à éviter; export "ma palette" partageable. 
- **[18.4] Color → Makeup match.** AC: teintes recommandées rouge à lèvres/blush/fond de teint selon saison; passerelle vers EPIC Makeup. Réf: "enchaîner color + makeup".
- **[18.5] Color → Hair harmony.** AC: vérifier l'accord couleur de cheveux/teint; suggestions de nuances. Réf: P2 "accord couleur cheveux/teint".
- **[18.6] Carte "Your Colors" partageable (hook TikTok).** AC: visuel vertical 9:16 brandé avec saison + palette, bouton partage. Réf: Plan point 5 (acquisition organique), drapage viral.

## EPIC 19 — Maxed-Out Self réaliste (tous personas) [P1]
**Objectif:** différenciation par le réalisme (frustration générale du rendu "yassified"). Déjà câblé (Gemini Nano Banana, identité préservée) → durcir les garde-fous. Réf: Pilier 2 opportunité 1, Plan point 4.

- **[19.1] Bridage structurel.** AC: prompt + post-check interdisant modif d'ossature/forme du visage; corrections limitées à peau/cernes/coiffure/relight/volumes maquillage. (déjà dans le prompt worker, à verrouiller/tester).
- **[19.2] Garde-fous de préservation d'identité + QA.** AC: comparaison de similarité visage avant/après (rejet si dérive trop forte); fallback. 
- **[19.3] Curseur d'intensité naturel ↔ glam.** AC: 2-3 niveaux; "naturel" par défaut (anti-dysmorphie).
- **[19.4] Toggles par zone.** AC: activer/désactiver peau / cernes / cheveux / lumière séparément.
- **[19.5] Carte before/after partageable + disclaimer.** AC: "visualisation artistique IA, divertissement"; slider before/after exportable.

## EPIC 20 — Corporate & Style Image (P3 Corporate Ascender) [P1]
**Objectif:** servir la pro en transition (image, légitimité). Réf: Pilier 1 (P3), matrice WTP (Headshot/Hair/Maxed-Out élevés pour P3).

- **[20.1] AI Headshot pro.** AC: portrait soigné "clean girl/quiet luxury", fond neutre; identité préservée.
- **[20.2] Coiffures bureau rapides.** En tant que pro, je veux des coupes structurées faciles à coiffer le matin. AC: suggestions try-on + temps de coiffage estimé.
- **[20.3] Plan maquillage bureau.** AC: routine "soignée" rapide, étapes; lié à la saison colorimétrique (18.4).
- **[20.4] Color season appliquée au workwear.** AC: do/don't couleurs tenues de bureau.
- **[20.5] Check signes de fatigue.** AC: lecture cernes/teint terne liée au rythme de travail + remèdes (lien EPIC 17). Réf: matrice WTP P3 "signes de fatigue".

## EPIC 21 — Apple-safe & anti-dysmorphie (tous) [P0 — bloquant store]
**Objectif:** survivre à la modération Apple (guideline 1.2) et au positionnement bienveillant. Réf: Plan points 1 et 4, exclusion ado.

- **[21.1] Refonte sémantique clinique.** AC: supprimer toute notation chiffrée de défauts / comparaison génétique / "looksmax score"; remplacer par "Facial Harmony and Balance Index", "Skin Health Score". Audit de toutes les chaînes UI.
- **[21.2] Framing potentiel + plancher.** AC: score plancher (≥55), potentiel ≥ overall+3, vocabulaire d'amélioration atteignable (softmaxxing).
- **[21.3] Ressources bien-être.** AC: lien NEDA/soutien, message si score bas; pas de comparaison classante entre utilisatrices.
- **[21.4] Age gate 17+ + exclusion ciblage ado.** AC: gate persistant; copy/ASO sans termes "rate my face" agressifs. Réf: persona 7 exclu.
- **[21.5] Consentement IA explicite.** AC: opt-in traitement photo, mention stockage/suppression. (lien 22.5)

## EPIC 22 — Onboarding valeur + confiance (tous) [P0]
**Objectif:** compenser le hard paywall par une valeur perçue clinique (conversion 1,2-2,5%) et lever la peur des données. Réf: Plan point 3, attente communautaire #3 (sécurité données).

- **[22.1] Quiz ~11 questions personnalisation.** AC: sensibilité dermato, exposition soleil, sommeil, routine actuelle, préférences maquillage, objectifs; barre de progression. Réf: Plan point 3.
- **[22.2] Détection + branchement persona.** AC: classer en P1/P2/P3 et adapter le reveal + le plan + l'ordre des outils.
- **[22.3] Sentiment "analyse clinique haut de gamme".** AC: micro-copy + animation d'analyse; récap personnalisé avant paywall.
- **[22.4] Écran sécurité des données.** En tant qu'utilisatrice, je crains que mon selfie soit réutilisé. AC: promesse explicite (traitement, non-revente, suppression, pas de forum public); visible avant l'upload. Réf: attente #3.
- **[22.5] Reveal partiellement flouté → paywall (déjà construit).** AC: garder le pattern Aura; brancher le score clinique (21).

## EPIC 23 — Rétention & communauté (P1 + LT) [P1]
**Objectif:** créer des cas d'usage quotidiens hors scan. Réf: Plan point 7, étape 3 (rituels physiques).

- **[23.1] Rituel hebdo + rappels.** AC: cadence de scan, notifs, récap progrès.
- **[23.2] Timeline de progression.** AC: peau (clarté), posture, colorimétrie historisées.
- **[23.3] Programmes exercices ciblés.** AC: face yoga, drainage lymphatique, jawline/debloat, posture bureau; calendrier; vidéos/guides. Réf: étape 3, P5/P6.
- **[23.4] Forum féminin privé.** AC: espace style Reddit privé, partage anonyme d'évolution, conseils saison/skincare; modération. Réf: Plan point 7 (rétention +mois). Note: gros risque conformité/modération → MVP read-only ou différé.

## EPIC 24 — Acquisition & funnel (P2 + croissance) [P1]
**Objectif:** viralité par construction + marge. Réf: Plan points 5/8/9/10, playbook Cal AI.

- **[24.1] Cartes résultat partageables par feature.** AC: 9:16 brandées (score, palette, before/after) avec CTA app.
- **[24.2] Invitations incitatives (pas de blocage 3-partages).** AC: partage optionnel débloque bonus (Relight, Headshot), jamais obligatoire pour voir le résultat. Réf: Plan point 9 (anti-abandon Umax).
- **[24.3] Tunnel Web-to-App (Stripe).** AC: landing onboarding + paiement annuel 59,99$ via Stripe avant download → évite 30% Apple. Réf: Plan point 8.
- **[24.4] A/B offres paywall.** AC: tester mise en avant annuel 59,99$ / à vie 39,99$ vs hebdo 12,99$. Réf: Plan point 10.
- **[24.5] ASO + kit contenu TikTok pilote.** AC: titre/sous-titre/keywords (Pilier 3); 5 formats de vidéos (scan colorimétrie 3s, GRWM, before/after). Réf: Plan point 5.

---

## Séquence de build recommandée (sprints)
- **Sprint A (conformité + cœur valeur):** EPIC 21 (Apple-safe) + EPIC 17 (Skin Diagnostic) + EPIC 22 (onboarding/confiance). = débloque store + rétention P1 + conversion.
- **Sprint B (acquisition organique):** EPIC 18 (Color Season Studio) + EPIC 24.1/24.2/24.5 (cartes + invite + ASO/contenu). = moteur viral P2.
- **Sprint C (profondeur + LT):** EPIC 19 (Maxed-Out durci) + EPIC 20 (Corporate) + EPIC 23 (rétention/communauté) + EPIC 24.3/24.4 (Web-to-App, A/B).

## Décisions produit à trancher (avant build)
1. **Ajouter la Colorimétrie (EPIC 18)** à la suite verrouillée ? (forte reco: #2 valeur + acquisition). Impacte le scope.
2. **Persona lead officiel:** garder "Optimisatrice data-driven" ou basculer sur **Glass Skin Devotee** (#1 valeur/rétention) ?
3. **Forum communautaire (23.4):** MVP maintenant (risque modération/Apple UGC) ou différé ?
4. **Web-to-App Stripe (24.3):** prioriser pour la marge dès le lancement ou après le PMF ?

## KPIs par persona
- P1: scans hebdo/utilisatrice, rétention S4/S8/S12, delta clarté moyen.
- P2: partages de carte "Your Colors", CAC organique, taux conversion onboarding.
- P3: conversion hebdo 12,99$, usage Headshot/Hair/Makeup.
- Global: conversion hard paywall (cible 1,2-2,5%), MRR, taux de remboursement, note App Store.

---

## EPIC 25 — Stress-Faciomètre / Cortisol Face (DIFFÉRENCIATEUR HERO) [P0-diff]
**Objectif:** les "20%" de différenciation. Cadrage bien-être (état physiologique RÉVERSIBLE: rétention d'eau + inflammation liée au stress), jamais d'attractivité. Réf: [etude-differenciation-stress-faciometre-2026-06.md](market-research/etude-differenciation-stress-faciometre-2026-06.md) (score 8,65/10, saturation concurrentielle très faible). Sert d'output partageable n°1 (moteur d'acquisition organique #cortisolface 1B+ vues).

- **[25.1] Diagnostic volumétrique matinal.** En tant qu'utilisatrice stressée, je veux comprendre pourquoi mon visage est gonflé le matin. AC: selfie dans repère ovale + 3 questions rapides (sommeil, sodium, phase du cycle); micro-copy clinique ("tension sous-orbitaire", "rétention hydrique"); AUCUN score d'attractivité.
- **[25.2] Stress & Bloat Index (1-10).** AC: indice de bien-être /10 (bas = mieux) + zones congestionnées en bleu translucide (sous-yeux, mâchoire); framing réversible et bienveillant; pas de classement entre utilisatrices.
- **[25.3] Projection physiologique (moment "wow").** AC: slider before/after = visage actuel vs simulation IA "dégonflé après 7 jours" (Gemini Nano Banana, identité strictement préservée): volumes décongestionnés, cernes atténués, traits détendus, AUCUNE modif d'ossature.
- **[25.4] Massage lymphatique guidé.** AC MVP: timer guidé 8 min (étapes + haptics + voix), mouvements ascendants; AR overlay temps réel (vision-camera + FaceMesh) = beta natif (P1).
- **[25.5] Carte partageable "Stress & Bloat Index" + transition before/after.** AC: 9:16 brandée, hook TikTok ("high cortisol face card"); export 1 tap.
- **[25.6] Suivi quotidien de l'index (rétention).** AC: re-mesure quotidienne + courbe; corrélation sommeil/sodium; nudge matinal. [P1]
- **[25.7] Recommandations d'actifs de-puff/anti-inflammatoires** (caféine, drainage), affiliate-ready sous réserve conformité (EPIC 21/24). [P1]
- **Worker:** endpoint `destress` (prompt Gemini de-puff/relax/lymphatique, identity-preserving), réutilise le pipeline `/api/transform`.
- **Conformité:** strictement bien-être/anti-dysmorphie (cf EPIC 21); proscrire toute note d'attractivité. **Anti-tendances à éviter:** PSL ratings, "beauty blindness challenges", simulateurs de chirurgie déformante (buccal fat removal).
- **Codable maintenant:** 25.1, 25.2, 25.3, 25.4 (MVP timer), 25.5. P1: 25.4 (AR), 25.6, 25.7.

### Plan de test organique 2 semaines (avant scale)
S1: 3 vidéos (explication biologique / transition 7 jours / GRWM Corporate) via créatrices, KPI rétention 3s >45%. S2: lien bio → landing + waitlist, KPI conversion LP >25%, coût/email <0,50$.
