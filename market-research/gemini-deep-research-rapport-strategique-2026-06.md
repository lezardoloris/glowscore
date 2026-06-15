# GlowScore — Rapport de recherche et d'orientation stratégique (Gemini Deep Research)

Archivé le 2026-06-14 depuis le chat (sortie Gemini Deep Research, demandée via le prompt "tous les personas + fonctionnalités + requêtes"). Complète et affine [[gemini-deep-research-personas-femmes.md]] (psychologie / money-map du 10/06). Réfs croisées: [[roadmap.md]], [[glowscore-plan-detaille.md]], [[viral-app-playbooks.md]], [[10-agent-review-backlog.md]].

Note de lecture: les tailles de marché et volumes de recherche sont des ordres de grandeur (Pinterest/Sensor Tower/estimations), pas des faits bancables. Les benchmarks de conversion hard paywall (1,2-2,5%) sont cohérents avec le marché. Les sources sont des fils Reddit (r/Splendida, r/Vindicta), App Store, et articles produits.

Marché US: apps esthétique/colorimétrie/looksmaxxing en forte croissance (Umax, Cal AI). Défis majeurs: rétention, instabilité des diagnostics, vigilance Apple sur la santé mentale.

---

## Pilier 1 — Cartographie et priorisation des personas féminins US

Contrairement au public masculin (compétition sociale rigide), les utilisatrices ont des motivations variées: self-care, harmonie esthétique naturelle.

### Les 8 personas (synthèse)

**1. La puriste de la colorimétrie (Color Analysis Purist)** — 18-34, CSP moy/sup, urbain. ~14M US. Peur de paraître fade; fantasme = connaître sa saison chromatique exacte. WTP élevée (alternative aux drapages physiques à 300-400$). Rétention faible/moyenne (une fois la palette connue). Conformité: très faible risque. Trigger: TikTok drapage, hésitation rouge à lèvres chez Sephora.

**2. L'obsédée de la peau translucide (Glass Skin Devotee)** — 18-30, CSP moy, K-beauty. ~11M US. Anxiété imperfections/pores; fantasme = "glass skin" sans fond de teint. WTP très élevée (dépense skincare préexistante). Rétention excellente (scan hebdo de la routine). Conformité: faible risque (positionnement dermatologique). Trigger: poussée d'acné, hyperpigmentation post-été.

**3. La professionnelle en transition (Corporate Ascender)** — 22-28, jeunes diplômées. ~8,5M US. Syndrome de l'imposteur; fantasme = look "clean girl / quiet luxury" pour l'autorité pro. WTP élevée (investissement carrière). Rétention moy/élevée. Conformité: très faible risque. Trigger: nouveau job, promotion, entretien.

**4. La future mariée (Bridal Glow-Up Planner)** — 24-35, fiancées. ~2,2M mariages/an US. Peur de regretter son visage sur les photos; fantasme = développement progressif optimal. WTP très élevée (budget mariage). Rétention très forte jusqu'au jour J (compte à rebours) puis chute. Conformité: faible/moyen. Trigger: achat de la robe, date des photos.

**5. L'optimisatrice de la silhouette (Body-Alignment Advocate)** — 20-35, fitness/pilates. ~8M US. "Skinny fat"; fantasme = remodeler selon ses proportions (Kibbe), posture. WTP moy/élevée. Rétention excellente (changement de mode de vie). Conformité: moyen (orienter posture + athlétisme sain).

**6. L'adepte de la longévité esthétique (Pro-Aging Strategist)** — 32-45, CSP sup. ~10,5M US. Crainte vieillissement cutané; fantasme = fraîcheur naturelle (face yoga, drainage) sans injections. WTP très élevée. Rétention excellente. Conformité: très faible risque. Trigger: affaissement de l'ovale sous lumière défavorable.

**7. L'adolescente en quête de repères (High School Social Optimizer)** — 13-17. ~12M US. Anxiété sociale/comparaison filtres; fantasme = note 100/100. WTP très faible (pas de CB, remboursements massifs). Rétention très faible. **Conformité: risque EXTRÊME (dysmorphophobie, blocages Apple).** → **À EXCLURE de l'acquisition payante.**

**8. L'adepte du maquillage correctif (Corrective Makeup Enthusiast)** — 16-28. ~9M US. Insatisfaction asymétries; fantasme = contouring structurant. WTP moyenne (préfère acheter du maquillage réel). Rétention moyenne. Conformité: faible risque (softmaxxing).

### Priorisation par valeur commerciale
`Valeur = Volume × WTP × Rétention × Viralité`

1. **Glass Skin Devotee** (priorité max) — valeur la plus élevée. Suivi clarté/texture = process long (8-12 sem) → cas d'usage répétitif aligné sur le scan hebdo GlowScore → rétention élevée → justifie l'annuel 59,99$.
2. **Color Analysis Purist** — acquisition organique massive (tendance virale TikTok/Pinterest, +2200% requêtes colorimétrie). Excellent taux de conversion au paywall d'onboarding (alternative éco aux consultations >300$).
3. **Corporate Ascender** — pouvoir d'achat autonome, besoin concret d'image pro → soutient l'hebdo 12,99$.

**Exclus de l'acquisition payante:** l'adolescente (pas de moyen de paiement, avis négatifs paywall, risque dysmorphie + bannissement Apple).

---

## Pilier 2 — Fonctionnalités concurrentes et conversion

### Concurrents (paywall · prix · déclencheur d'achat · rétention · faille)
- **Umax** — hard paywall post-onboarding. 3,99-9,99$/sem (+6,99$ "You as a 10/10"). Déclencheur: Symmetry Score + canthal tilt. Rétention: suivi note/mâchoire (mewing). Faille: pas à jour, conseils inadaptés aux femmes (barbe).
- **Glam Up** — hard paywall après analyse floutée. 4,99-8,99$/sem. Déclencheur: photo "yassified" IA. Faille: images irréalistes altérant l'identité.
- **Looksglo** — monétisé d'emblée. 9,99$/sem, 34,99$/an. Déclencheur: Face Maps (acné/sébum). Rétention: forum communautaire actif. Faille: indispo Android.
- **WhatColors** — hard paywall. 3,99$ entrée, Pro 7,99-14,99$, 59,99$ à vie. Déclencheur: extraction palette. Faille: instabilité d'analyse selon l'éclairage.
- **Mogged** — hard paywall post-onboarding. ~4,50$/sem, 33$/an, 8,20$/rapport. Déclencheur: notation structure osseuse mâchoire. Faille: terminologie trop masculine/agressive.

### Matrice Fonctionnalité × Persona (intérêt + tarif toléré)
- **Face Score & Symmetry**: Glass Skin faible · Color faible · Corporate élevé (12,99$/sem).
- **Maxed-Out Self (Before/After IA)**: Glass Skin fort · Color moyen · Corporate maximal (39,99$/an).
- **Diagnostic peau**: Glass Skin maximal (59,99$/an ou 12,99$/sem) · Color faible · Corporate moyen.
- **Colorimétrie (Color Season)**: Glass Skin moyen · Color maximal (59,99$/an ou 39,99$ one-shot) · Corporate élevé.
- **Coiffure (Hair try-on)**: Glass Skin faible · Color moyen · Corporate élevé.
- **Symmetry & Jawline (debloat/exercices)**: Glass Skin moyen · Color faible · Corporate élevé.

### Opportunités (failles concurrentes à exploiter)
1. **Maxed-Out Self réaliste**: frustration générale du rendu "yassified"/synthétique. → rendu IA subtil et photoréaliste qui préserve l'identité (peau, cernes, densité capillaire, harmonie maquillage), pas la structure osseuse. *(déjà implémenté: prompt Nano Banana "fully preserve the core identity").*
2. **Fiabilité du diagnostic couleur**: instabilité selon l'éclairage. → calibration dynamique (photo d'une feuille blanche / zone du cou sans ombre).
3. **Clarté de facturation**: rejet des frais cachés/relances (Umax, Aura). → hard paywall clair et unique, accès total immédiat, aucun achat unitaire caché.

### Ordre d'intégration recommandé
- **Étape 1 (acquisition/conversion):** Diagnostic dermatologique (Skin Clarity → Face Maps cliniques) + Colorimétrie faciale (Color Season → palette + maquillage).
- **Étape 2 (engagement/surprise):** Maxed-Out Self réaliste (projection sans déformation).
- **Étape 3 (rétention LT):** Suivi hebdo (streak, progression clarté/posture) + exercices ciblés (posture bureau, drainage lymphatique).

---

## Pilier 3 — Demande réelle, requêtes, ASO

### Volumes de recherche US (estimés)
- `color season analysis` (+ "how to find my color season", "seasonal color palette test"): ~180 000/mois, **+2200% (Pinterest)**.
- `how to get glass skin` (+ routine, Korean guide): ~90 000/mois, +45%.
- `facial symmetry test` (+ "is my face symmetrical app", "facial harmony calculator"): ~65 000/mois, +10%.
- `jawline exercises for women` (+ "lose face fat fast", "mewing tutorial"): ~55 000/mois, +35%.
- `looksmaxxing guide female` (+ "softmaxxing checklist r/splendida", "level up my looks"): ~25 000/mois, +80%.

### Attentes communautaires (Reddit)
1. Rejet du vocabulaire masculin "incel" → approche softmaxxing pragmatique.
2. Demande de guides concrets et ordonnés (pas qu'un score /100 arbitraire).
3. Sécurité stricte des données (peur de réutilisation/vol des selfies) → politique explicite dès l'onboarding.

### ASO US
- **Titre (30c):** `GlowScore: AI Color Analysis` ou `GlowScore: AI Glow Up Planner`.
- **Sous-titre (30c):** `Skin Diagnostics & Face Shape` ou `Find Your Color Season & Style`.
- **Keywords (100c):** glowup, coloranalysis, faceshape, symmetry, glassskin, skincare, hairstyle, makeup, mewing, aesthetic, palette, season.

---

## Benchmarks — acquisition, monétisation, risques

### Acquisition (playbook Cal AI, 30M$ ARR)
1. **Validation organique:** comptes de marque pilotes (ex @getglowscore) sur TikTok, vidéos quotidiennes du scan colorimétrie (clic → scan 3s → palette).
2. **Saturation micro-influenceuses:** 100-150 créatrices esthétique/K-beauty sous contrat d'exclusivité, intégration naturelle "GRWM" (pas de pub directe).
3. **Achat média:** convertir les meilleurs organiques en direct-response ads Meta/TikTok, ciblage large, redirection App Store.

### Monétisation (hard paywall)
- Pas d'essai gratuit: 12,99$/sem · 59,99$/an · 39,99$ à vie pour accéder au 1er résultat.
- Free trial 3j (type Cal AI): ~57% activation, 30-50% conversion finale. Hard paywall strict: volume initial réduit mais 100% des comptes actifs paient; **conversion attendue 1,2-2,5%** du trafic d'onboarding.
- Compenser la barrière: onboarding à forte valeur perçue (questions type peau, soleil, sommeil, maquillage) → sentiment d'analyse clinique personnalisée.
- Annuel 59,99$ dès l'onboarding pour capter les personas LT (Glass Skin, Color) et réduire l'attrition de l'hebdo.

---

## Plan d'action — 10 décisions prioritaires

1. **[Critique] Sémantique conforme Apple.** Supprimer notation faciale chiffrée / défauts / comparaison génétique. Remplacer par vocabulaire clinique ("Facial Harmony and Balance Index", "Skin Health Score"). Atténue le risque guideline 1.2 (objectification).
2. **[Majeur] Calibration colorimétrique.** Étape d'étalonnage lumière (feuille blanche / cadrage) → fiabilité, évite les avis 1 étoile sur résultats instables.
3. **[Majeur] Onboarding ~11 questions** centrées personnalisation (sensibilité, soleil, routine, préférences) → valeur perçue → conversion hard paywall.
4. **[Majeur] Maxed-Out Self bridé** sur peau/cernes/coiffure/relight, jamais sur la structure osseuse → réalisme, anti-dysmorphie. *(déjà aligné côté worker)*
5. **[Majeur] Pipeline micro-influenceuses** TikTok/Instagram (K-beauty + colorimétrie), 100-150 créatrices sous contrat.
6. **[Moyen] Tarification sans options cachées** — l'abo débloque toute la suite.
7. **[Moyen] Forum d'entraide féminin** intégré (style Reddit privé) → usage quotidien hors scan → rétention.
8. **[Moyen] Tunnel Web-to-App** (onboarding + paiement annuel via Stripe avant download) → évite la commission 30% Apple/Google.
9. **[Tactique] Invitations incitatives** (pas de partage obligatoire à 3 contacts façon Umax → abandon élevé). Bonus = outils secondaires (Relight, Headshot). *(aligné: garder invite mais optionnel)*
10. **[Tactique] Tests d'offres** annuelle 59,99$ / à vie 39,99$ vs hebdo 12,99$ dès la 1ère présentation → maximiser la valeur transaction immédiate.

---

## Implications pour la roadmap GlowScore (écarts vs décisions verrouillées)

- **Persona lead à reconsidérer:** ce rapport classe **Glass Skin Devotee #1** et **Color Analysis Purist #2** par valeur commerciale (vs "Optimisatrice data-driven 18-28" verrouillée). La rétention vient du suivi peau hebdo; l'acquisition organique vient de la colorimétrie.
- **GAP fonctionnel majeur: la Colorimétrie (Color Season) n'est PAS dans la suite verrouillée** (Glow Up, Maxed-Out Self, Skin, Hair, Makeup, Relight, Headshot, Age, Fitness). Or c'est le #2 en valeur et le plus gros driver d'acquisition organique (+2200%). → décision produit à trancher: ajouter un outil Color Season (+ calibration lumière).
- Aligné: hard paywall clair, anti-dysmorphie/Apple-safe, 17+, invite optionnel, prix 12,99/59,99/39,99.
- Nouveaux chantiers suggérés: Skin Diagnostic = pièce centrale onboarding (Face Maps), tunnel Web-to-App (Stripe, marge), forum communautaire.
