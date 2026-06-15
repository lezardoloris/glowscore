# Review 10 agents — PERSONA-PRODUCT-PLAN (EPIC 17-24)

Date: 2026-06-14. Plan revu: [PERSONA-PRODUCT-PLAN.md](../PERSONA-PRODUCT-PLAN.md). 10 angles indépendants. Style: pas de tirets cadratins.

## Scoreboard
| Angle | Note /10 | Verdict 1 ligne |
|---|---|---|
| CRO / paywall | 6 | Bon échafaudage de valeur, mais l'écran paywall lui-même n'est pas spécifié (anchoring, urgence, win-back). |
| Rétention / lifecycle | 6 | Le bon moteur (scan hebdo + delta) mais traité comme 1 story; rien pour D1-D7. |
| Conformité Apple | 5,5 | Score facial chiffré conservé = vecteur de rejet #1; firewall claims médicales absent. |
| Faisabilité IA | 6 | Funnel/score/glow-up OK, mais Face Maps coordonnées + colorimétrie stable = pas fiables tels quels. |
| Persona P1 Glass Skin | 6,5 | Les os sont là; manque la substance skincare (produits, preuve, crédibilité derma). |
| Persona P2 Color | 7,5 | Mieux qu'attendu (EPIC 18 existe), mais 0 rétention pour elle + carte pas assez "drama". |
| Growth / viralité | 6 | Bons choix, mais viralité silotée dans EPIC 24 au lieu d'être l'output par défaut. |
| UX / design | 6 | Features fortes, IA en éventail sans colonne vertébrale (où vit Color Season ?). |
| Privacy / trust | 4,5 | **Le plus faible.** Biométrie/BIPA, rétention R2, DPA Google/fal absents. |
| Monétisation | 5,5 | Silence sur le COGS par action = fatal; lifetime 39,99$ cannibalise l'annuel. |

Moyenne ~5,9/10. Plancher: Privacy (4,5). Plafond: Color (7,5).

## Consensus (signalé par 3+ agents = priorité absolue)
1. **CUT le forum (23.4) de la v1** — 6 angles (CRO, rétention, conformité, growth, privacy, monétisation): risque UGC Apple + modération + doxxing/BIPA, ROI conversion nul. Décision: supprimer de la v1 (éventuel retour post-PMF, texte seul, report/block/mod).
2. **Une seule capture → plusieurs lectures** (UX, IA, rétention, monétisation): skin + color + maxed-out doivent partir d'UN selfie calibré, pas 4 rituels photo. Réduit friction ET COGS. Le re-scan hebdo est la seule capture répétée.
3. **La viralité doit être l'output par défaut, pas un EPIC** (growth, P2, UX): chaque écran de résultat auto-génère une carte 9:16; le hook viral = **le "drape reveal" colorimétrie 3s** (18.2→18.6); **manque un scan "lite" gratuit web** (top of funnel indexable/partageable) qui alimente le Web-to-App; économie de parrainage bilatérale absente.
4. **Le score facial chiffré reste le vecteur de rejet Apple #1** (conformité): renommer un score /100 ne le supprime pas. + **firewall claims médicales manquant** (1.4.1: "Skin Health Score", "diagnostic dermatologique", drainage = remèdes). + retirer "looksmaxxing/mewing/symmetry" de l'ASO (24.5).
5. **BIPA / consentement biométrique + rétention R2 (auto-delete) + DPA Google/fal** absents (privacy = plus gros risque légal): visages envoyés à des tiers sans terms, R2 sans TTL, pas de endpoint suppression/DSAR.
6. **COGS par action non plafonné** (monétisation, IA): scans IA illimités détruisent la marge; **lifetime 39,99$ cannibalise l'annuel 59,99$ + coût non borné**; les retries (QA 19.2, rejets calibration 18.1) coûtent sans valeur. Besoin fair-use + cache de la 1ère analyse + appels parallélisés.
7. **Pont activation→habitude D1-D7 manquant** (rétention): le plan saute paywall→cadence hebdo sans rien pour les 7 premiers jours (où le churn hard-paywall est max). Besoin "fais 3 actions, vois ton 1er delta avant J7".

## Drapeaux faisabilité IA (à reconcevoir avant build)
- **17.1 Face Maps à coordonnées exactes**: un vision LLM hallucine les positions de lésions (comme le percentile qu'on a dû rendre déterministe). → **face-parsing/FaceMesh (468 landmarks) → noter par ZONE** (front, joues, menton), colorier la zone, pas la lésion.
- **18.1/18.2 colorimétrie 12 saisons stable**: feuille blanche ≠ vraie balance des blancs (auto-WB, HDR, métamérisme). Même visage → 2 saisons. → échantillonner les pixels peau/yeux/cheveux (régions FaceMesh), normaliser gray-world, classer par distance Lab à des centroïdes; **réduire 12→4 saisons + sous-ton + score de confiance**, jamais un label dur unique.
- **19.2 QA d'identité**: nécessite un vrai embedding visage (ArcFace via fal) + seuil cosinus + 1 retry/fallback (double latence/coût). Aujourd'hui aspirationnel.
- **19.4 toggles par zone**: 1 passe Nano Banana n'est pas décomposable en couches; 4 toggles = jusqu'à 16 générations. → **2-3 presets d'intensité** (1 génération chacun).
- **17.4 delta de re-scan**: sans pose/lumière verrouillées, le bruit > le vrai changement. → guide de capture + réutiliser la calibration; gater les deltas chiffrés derrière un check qualité.
- **Coût/latence cumulés**: l'onboarding chaîne scan+glow-up+color+cards (chacun 5-30s, qqs cents) → dépasse le timeout worker 25-30s et empile le coût sur un funnel où la majorité ne paie pas. Cacher la 1ère analyse, paralléliser.

## Tensions à arbitrer
- **Anti-dysmorphie (naturel par défaut, 19.3) vs before/after viral dramatique** (growth): garder naturel in-app, autoriser un **export "glam" pour le partage** (avec disclaimer).
- **Color = acquisition forte mais WTP-au-paywall faible** (CRO): le trafic Color déprime le taux de conversion onboarding → **le paywall doit mener avec la Peau (WTP max), pas la palette**; router le hook paywall par persona (22.2).
- **P2 rétention nativement faible et non traitée** (P2): toute la rétention (23.x) est skin. → ajouter usage récurrent color (audit garde-robe, "Wear This Today", shade matcher shoppable).

## Top 10 actions priorisées
**P0 (avant/pendant build cœur)**
1. CUT forum 23.4 v1. (consensus #1)
2. Architecture **single-capture** (1 selfie calibré → skin+color+maxed-out) + cache analyse. (#2, #6, IA)
3. **Conformité dure**: retirer tout score facial chiffré exposé → bandes qualitatives non classées; firewall claims médicales (disclaimer + wordlist bannie); nettoyer ASO. (#4)
4. **Privacy/biométrie**: story consentement BIPA/GDPR-Art.9, TTL R2 + auto-delete, endpoint "delete my data"/DSAR, DPA Google+fal, liste sous-traitants. (#5)
5. **Fair-use + unit economics**: caps de scans/transforms, gross-margin-per-active-user en KPI P0, lifetime repricé (99-129$) ou retiré du A/B par défaut. (#6)
6. **Spec écran paywall**: 3 tuiles, annuel pré-sélectionné + "92% off weekly", anchoring "$1,15/sem", value-stack checklist, urgence one-time, social proof; **win-back pour les 97% qui refusent**. (CRO)

**P1 (différenciation/croissance)**
7. **Free web lite-scan "What's My Color Season"** (sans paywall) + carte auto-partage → alimente Web-to-App 24.3. (#3, growth)
8. **Carte partageable auto sur chaque résultat** + **drape reveal 3s** comme hook viral + **parrainage bilatéral** instrumenté (K-factor). (#3)
9. **Pont activation D1-D7** (3 actions → 1er delta avant J7) + matrice notifs lifecycle (D1/D3/D7/hebdo/win-back/pré-renouvellement). (#7, rétention)
10. **Rétention P2** (audit garde-robe, "Wear This Today", shade matcher shoppable) + **profondeur skincare P1** (produits/SKU réels, conflits d'actifs, concentrations, journal de poussées reliant sommeil/soleil/cycle). (P1, P2)

**IA refactors** (transverses): zone-maps via FaceMesh (17.1), 4-saisons+sous-ton déterministe (18.x), embedding QA (19.2), presets vs toggles (19.4).

## Ajustements de verdict par EPIC
- EPIC 17 Skin: garder P0, mais 17.1 → zone-maps; approfondir 17.6 (produits réels) et ajouter journal/triggers.
- EPIC 18 Color: garder P0; 18.2 → 4 saisons + sous-ton + confiance; ajouter rétention color + shade matcher shoppable + drame social sur la carte.
- EPIC 19 Maxed-Out: 19.2/19.4 à refonder (embedding + presets); ajouter export glam pour partage.
- EPIC 20 Corporate: dé-prioriser (faible viralité + faible rétention), post-PMF.
- EPIC 21 Conformité: renforcer (score non-chiffré + firewall médical + ASO).
- EPIC 22 Onboarding: raccourcir (~6 Q + calibration intégrée à la capture), router le paywall par persona.
- EPIC 23 Rétention: CUT 23.4; ajouter micro-loop quotidien + milestones qui débloquent les one-shots.
- EPIC 24 Acquisition: free web lite-scan + auto-cartes + parrainage bilatéral; avancer Web-to-App (pas "après PMF").

## Décisions à trancher (revues)
1. Ajouter Colorimétrie (EPIC 18): **OUI fort** (P2 = 7,5, meilleur driver acquisition).
2. Persona lead officiel: **basculer Glass Skin Devotee** (#1 valeur/rétention) comme cœur produit, Color comme moteur d'acquisition.
3. Forum 23.4: **CUT v1** (consensus).
4. Web-to-App: **avancer** (ne pas attendre PMF) pour la marge + le loop viral, MAIS valider 3.1.1 Apple d'abord.
5. Single-capture vs scans multiples: **single-capture** (consensus UX/IA/coût).
