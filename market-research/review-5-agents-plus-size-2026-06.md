# Review 5 agents - Vertical femmes US plus-size (2026-06-15)

Revue du plan [EPIC-PLUS-SIZE-WOMEN.md](EPIC-PLUS-SIZE-WOMEN.md) + du code support, par 5 agents (PM/priorisation, conformité/Apple, technique, growth/acquisition, UX/rétention). Style: pas de tirets cadratins.

## Les 2 découvertes critiques (consensus)

### CRIT-1. Le moteur de reco est du code mort (PM + Technique)
`recommendProducts()` / `contextFromQuiz()` ne sont appelés par AUCUN écran. `app/(tabs)/plan.tsx` re-exporte `glow-plan.tsx` qui n'affiche que les `GlowTask` d'AsyncStorage, jamais une `ProductRecommendation`. Donc corriger PS-0 ne change rien de visible: tant que le moteur n'est pas branché dans un écran, tout le body care reco et l'affiliation sont invisibles. **C'est la chose n°1 à faire.** (Cursor a depuis ajouté `recommendForQuiz()` comme helper, mais il faut encore l'appeler et rendre les cartes produits dans un écran.)

### CRIT-2. MAX_PLAN_TASKS=5 éjecte le body care du plan quotidien (UX)
Le plan est cappé à 5 tâches: FOUNDATION(3) + focus + capstone. Pour un user `body_glow` secondaire (ou primaire jawline/cortisol), les tâches body care sont ajoutées APRÈS puis tranchées par `.slice(0,5)`. La femme qui télécharge pour le confort corps reçoit une checklist visage et sa raison de venir n'entre jamais dans la boucle de rétention. **Réserver >=2 slots body care quand `body_glow` est présent** (ou trimmer FOUNDATION à 2 pour ce persona).

## Conformité (Apple / FTC) - bloquants avant soumission

- **DRUG-1 [P0]** Ne jamais nommer de médicament OTC antifongique en copy/data (clotrimazole, miconazole, pyrithione zinc "antifongique", et le produit `zeasorb_af` / Zeasorb AF Powder). Recommander un médicament pour une dermatose nommée (intertrigo) = claim médical, risque rejet 1.4.1 / catégorie Médical. Reframer l'intertrigo en "garder les plis au sec et confortables" (nettoyant doux sans parfum, sécher, barrière oxyde de zinc/vaseline cosmétique) + carte "voir un pro si ça s'étend/suinte/sent".
- **CLAIM-1 [P0]** Supprimer "firmness support" / "fermeté/densité" (glowPlan.ts task bodycare peptides, PS-4.1). Claim structure/fonction = drug cosmétique non approuvé. Utiliser apparence/confort: "peau hydratée, confortable, d'aspect sain".
- **BRAND-1 [P0]** Bannir "Ozempic" / "GLP-1" de toute copy, titre, screenshot ET ASO (PS-4.3, PS-6.1). Marque + médicament. Remplacer par "skin through change", "volume loss support".
- **FTC-1 [P0]** Disclosure affiliée claire et visible à côté de CHAQUE reco/lien produit, avant le clic ("Some links are affiliate links; we may earn a commission at no extra cost to you"). Aucune n'existe. Coder une constante partagée `AFFILIATE_DISCLOSURE` rendue par le composant produit.
- **PRIV-1 [P1]** Photos de zones corps (sous-poitrine, ventre, aine) plus sensibles que le selfie visage: consentement séparé, défaut local-only, ne pas envoyer de nudité au modèle tiers, label App Privacy, zéro champ poids/mesure.
- **WORD-1 [P1]** Renommer "treatment plan" -> "glow-up plan / care plan" (onboarding). Réévaluer l'exposition de "Surgical/Botox/fillers/lasers" dans ce vertical.
- **GUARD-1 [P1]** Coder les garde-fous (pas en prose): `BANNED_TERMS` (weight, BMI, calorie, lose, Ozempic, GLP-1, fat, slim, eliminate, fix, flaw, double chin) + test CI qui grep toute la copy/JSON shippée; `AVOID_INGREDIENTS` en filtre dur du moteur (pas juste affiché); `DISCLAIMER` rendu à un endroit obligatoire testé; allowlist des inputs du score (pas de diet/workout/weight). Retirer "sodium < 2000 mg" (instruction diététique chiffrée).

## Technique (au-delà de CRIT-1)

- **PS-0.4 incomplet** (déjà corrigé par Claude, voir plus bas): `intertrigo_plis` et `peau_relachee_post_weight_loss` n'avaient AUCUN produit -> reco_032/034 renvoyaient le mauvais produit par accident. `hyperpigmentation_friction` n'avait ni règle ni produit ni mapping.
- **Experience filter [P0 régression]**: Cursor a mis `body_glow` -> experience `'intermediate'` alors que reco_031-035/048 sont `'beginner'`; avec le match exact, plus aucune règle plus-size ne firait. Corrigé en plancher (intermediate reçoit beginner).
- **skinType 'tous'** cassait 5 des 9 concerns visage (règles à skin_type spécifique jamais matchées). Corrigé en wildcard.
- **dedup** sautait reco_035 (même produit que reco_032). Corrigé: garde l'avis sans carte produit dupliquée.
- **dayKey UTC [P2]** dans glowPlan.ts + glow-plan.tsx: pour les users US en soirée, `toISOString()` bascule au lendemain -> streak/colonne "aujourd'hui" off-by-one. À passer en date locale (coordonné: logique dans glowPlan.ts = Claude, écran glow-plan.tsx = Cursor).
- **Concerns picker** (9 concerns visage) ne peut jamais produire la persona plus-size: le Body Care Hub doit appeler `contextFromQuiz`/`recommendForQuiz`, pas passer par `concerns.tsx`.

## Growth / acquisition

- **GTM-1 [P0]** Pas de plan d'acquisition payante / modèle CAC-LTV. Pour un hard paywall, les ads UGC payantes SONT le moteur de scale. Cible CAC < 0,5x LTV annuel, payback < 3 mois.
- **GTM-2 [P0]** Promouvoir le free web "lite" de-bloat scan (PS-6.3) en premier asset: répond à la méfiance (valeur avant paywall) ET au risque review Apple. Free scan -> email -> soft paywall.
- **PAYWALL [P0]** Ne pas hard-waller AVANT un moment de valeur (laisser finir 1 scan/1 protocole, puis waller le plan/tracking). Tabler sur 18-22% (proche Health&Fitness), pas 28%+.
- **INVITE [P1]** Retirer le gate invite-3-friends pour ce persona: catégorie body-shame-adjacent, demander de diffuser l'app à 3 amies est un frein, pas un loop viral. Garder le referral en option/récompense, jamais en unlock.
- **ASO [P1]** Exclure "intertrigo" (90-110k mais intention MÉDICALE, pire converteur + risque claim) de l'ASO. Cibler le commercial: chub rub relief, anti chafe, ozempic face (à éviter pour la marque -> "skin firming"), depuff face, round face makeup.
- **AFFILIATE [P1]** Reframer l'affiliation Amazon comme feature de confiance/rétention, PAS un pilier revenu. Maths réalistes: ~$150-1500/mois à 10-50k MAU (3-4% commission x $25 panier). Mettre à jour le langage "revenus affiliés" du plan.
- **UGC [P1]** Re-ranker les créatrices par fit produit, pas par audience. Vague 1: Katie Sturino (792K, a fondé Megababe = anti-chafe, fit parfait) + Taryn Hicks + une mid-tier (Rochelle Johnson / Raeann Langas). Offre: lifetime gratuit + petit fixe + rev-share abo + droits d'usage paid ads.
- **RETENTION [P2]** Ajouter loop lifecycle (push de-bloat matin, check-in J3, winback J14/J30): la rétention H&F J30 ~3,7% fuit sans ça.

## UX / rétention

- **Body Care Hub = triage, pas un menu**: zone -> 1 question symptôme (réutiliser le composant `Question` de stress-scan) -> protocole en cartes d'étapes (réutiliser `rStep`), pas un article type WebMD. La liste "à éviter" en chips "smart-shopper", pas en avertissements.
- **Jamais de silhouette corps avec zones marquées** (trope diet-app screenshotable). Macro-crops dignes (cuisse, aisselle) avec le même halo rose que les têtes visage. Poses détendues, jamais mains-qui-cachent/regard baissé.
- **Cadence séparée**: 1 habitude corps quotidienne dans la checklist (le baume + garder au sec), les protocoles lents sur une vue "cette semaine + progression 8-12 sem" (réutiliser `getPlanWeek`). UNE seule streak sacrée, zéro "échec" quotidien.
- **De-Bloat 5 min**: extraire `GuidedRoutine` de stress-scan en composant à prop `steps`, paramétrer le label "8-min" hardcodé, ajouter un timer par étape. Aha session 1 = before/after auto-animé + sensation "froid = tenseur" en 60 s.
- **Imagerie inclusive**: générer une GAMME (tailles x carnations profondes x âges) dans UNE esthétique rose-luxe cohérente, expressions sereines, + 1 hero "Glow at any size". Pas de mètre ruban, pas de balance, pas de "before" grisé.
- **Reframes copy**: "Soft V contour under chin" -> "Soft cool contour to add definition where you like it"; "Keep skin folds dry" (label) -> "Keep folds fresh and comfortable" (instruction précise en détail). Bannir "body concerns"/"problem areas".

## Ce que Claude a déjà corrigé (lane data/logique, tsc clean)
- PS-0.1/0.2/0.3 (les 3 bugs initiaux): ids `body_glow` alignés, persona auto `us_plus_size`, `body_oil` mappé.
- PS-0.4 complété: produit `cerave_healing` (intertrigo_plis), tag `peau_relachee_post_weight_loss` sur Medik8 Liquid Peptides, `theordinary_azelaic` + règle `reco_048` + mapping `hyperpigmentation_friction` (concern/goal/set).
- Régression experience corrigée (plancher), skinType en wildcard (débloque 5 concerns visage), dedup garde l'avis.
- reco_034 passé en `beginner`.

## Pertinent à faire ensuite, priorisé

P0 (avant tout test public / soumission):
1. **Brancher le moteur de reco dans un écran** (CRIT-1): Body Care Hub `app/body-care.tsx` qui appelle `recommendForQuiz(quiz)` + carte produit + lien affilié, et/ou un bloc "Recommended for you" dans `glow-plan.tsx` pour les plans `bodycare`. (Cursor)
2. **Réserver >=2 slots body care** dans `buildPersonaTasks` quand `body_glow` présent (CRIT-2). (logique = Claude/Cursor)
3. **Conformité**: retirer `zeasorb_af` + noms de médicaments, supprimer "firmness"/"Ozempic", ajouter `AFFILIATE_DISCLOSURE`, consentement photos corps. (Cursor + data)
4. **Free web lite de-bloat scan + soft paywall** (GTM-2, PAYWALL). (Cursor + landing)

P1:
5. MVP wedge: De-Bloat 5 min (PS-2.1) + Makeup round face (PS-3.1), réutilisant stress-scan.
6. Body Care Hub minimal: zone -> triage -> protocole (PS-1.1/1.2/1.6), intertrigo en "rester au sec/confort".
7. Garde-fous codés (BANNED_TERMS CI + AVOID filtre dur + DISCLAIMER testé). Retirer invite-3 gate.
8. Imagerie inclusive (PS-5.3) + audit copy anti-shame (PS-5.4) en gate de release.

P2:
9. dayKey local (anti off-by-one rétention). 10. Loop lifecycle notifications. 11. UGC vague 1 (Sturino). 12. Plan CAC-LTV + attribution.

## MVP pour valider la demande
PS-0 (fait) + brancher le moteur (1) + De-Bloat 5 min + Makeup round face + Body Care Hub intertrigo-only + imagerie/copy gate, puis instrumenter quel hub (de-bloat/makeup/corps) est le plus ouvert. Ce seul KPI dit si le différenciateur (corps) ou le wedge (visage) est la vraie demande.
