# Roadmap GlowScore — De la recherche au produit

> Basé sur : `cartographie-glow-up-us-fr-uk.md`, `reco-rules-50.json`, persona US plus size
> Horizon : 6 mois | Marchés launch : US → UK → FR

## Vision produit

**GlowScore** = coach glow-up personnalisé (skincare, colorimétrie, de-bloat, maquillage, cheveux, body care) avec routines courtes, reco produits affiliés, suivi visuel.

**Positionnement** : "Glow at any size. Simple routines, real results." (bien-être/cosmétique uniquement)

**Non-objectifs** : perte de poids médicale, prescription, diagnostic IMC/cortisol/pathologie.

---

## Phase 0 — Fondations données (Semaines 1-2)

### Objectif
Transformer la recherche en structures code exploitables.

| Tâche | Livrable | Fichier cible |
|---|---|---|
| Définir schéma FOCUS_TASKS | Interface TypeScript | `glowPlan.ts` |
| Importer 50 règles reco | JSON → moteur règles | `recoEngine.ts` |
| Catalogue 20 produits launch | Array produits affiliés | `products.ts` |
| Taxonomie concerns / skin types | Enum + quiz mapping | `quizSchema.ts` |
| Copy pack (10 titres + 10 push) | i18n EN only at launch | `routineCopy.ts` |

### FOCUS_TASKS MVP (13 tâches)

**P1 (launch)**
- `skin_barrier_repair`
- `color_season_discovery`
- `debloat_morning_routine`
- `body_chafe_prevent` (persona US)
- `body_fold_care` (persona US)

**P2 (v1.1)**
- `skin_pores_texture`
- `eyes_dark_circles`
- `hair_scalp`
- `makeup_contour_soft`

**P3 (v1.2)**
- `antiage_retinol_intro`
- `hair_volume`
- `makeup_no_makeup`
- `post_change_peptides`

### Critère de sortie Phase 0
- Quiz onboarding → 1 plan 7 jours généré automatiquement
- Au moins 3 règles reco par pilier testées unitairement

---

## Phase 1 — MVP App (Semaines 3-8)

### 1.1 Onboarding intelligent (Sem. 3-4)

**Flow quiz (5-7 min max)**

```
Écran 1 : Marché + langue (US/UK/FR)
Écran 2 : Objectif #1 (multi-select max 3)
  → debloat | glass skin | color season | cernes | pores | anti-âge | cheveux | body care
Écran 3 : Type de peau + sensibilité
Écran 4 : Expérience skincare (beginner / intermediate)
Écran 5 : Budget (budget / mid / premium)
Écran 6 : Persona flag (optionnel) → "I want body care for skin folds/chafing"
Écran 7 : Selfie opt-in (colorimétrie + suivi, privacy-first)
```

**Règles onboarding**
- Si `barriere_compromise` détectée (quiz) → forcer `skin_barrier_repair` en P1, bloquer exfoliants agressifs
- Si `beginner` + 3+ concerns → limiter à 1 pilier principal + 1 secondaire (anti-overwhelm)
- Si persona `us_plus_size` → injecter body care dans le plan même si non demandé explicitement (soft suggest)

### 1.2 Plan quotidien — glowPlan.ts (Sem. 4-5)

**Structure tâche**
```typescript
interface FocusTask {
  id: string;
  title: string;
  theme: Theme;
  frequency: 'daily_am' | 'daily_pm' | 'weekly' | '2-3x_week' | 'once';
  steps: Step[];
  persona_fit?: ('all' | 'us_plus_size')[];
  priority: 'P1' | 'P2' | 'P3';
}
```

**Programme 30 jours (template)**
| Semaine | Focus | Tâches actives |
|---|---|---|
| S1 | Barrière + debloat AM | barrier repair PM, debloat AM, SPF |
| S2 | + Texture douce | + PHA 2x/sem si peau tolère |
| S3 | + Yeux ou colorimétrie | selon objectif quiz |
| S4 | Consolidation + body care | routine stabilisée 4-5 steps |

### 1.3 Moteur reco produits (Sem. 5-6)

**V1 : règles statiques**
- Input : `{ concern, skin_type, experience, budget, persona?, market }`
- Output : 1-3 produits par catégorie manquante dans la routine
- Affiliation : Amazon US / Sephora / iHerb (liens par marché)

**Catalogue launch (20 SKU)**

| Tier | Produits |
|---|---|
| Budget | COSRX Snail, CeraVe, The Ordinary Niacinamide, Canmake Powder, Palmer's Body Butter, Body Glide |
| Mid | Medicube PDRN, Paula's BHA, Aestura Atobarrier, Mary & May Eye, Growus Shampoo, Merit Stick |
| Premium | Bobbi Brown Corrector, Danessa Myricks Balm, Christophe Robin Scrub |

**Garde-fous légaux**
- Pas de reco `prescription_cream` (reco_010 modifié → rétinal OTC)
- Pas de claims "cure cortisol face" ou "Ozempic treatment"
- Disclaimer bien-être sur chaque fiche produit

**Affiliate URLs (phased, not bulk)**
- Launch : English UI, US market; taps go to `glowupai.app/go/{id}` placeholders
- Real Amazon Associates links added in waves — see `expo-app/docs/AFFILIATE-ROADMAP.md`
- Wave 1 priority : body care + debloat SKUs (persona US differentiation)

### 1.4 Copy & notifications (Sem. 6)

- 10 titres routines (voir cartographie)
- 10 micro-push matin (debloat, SPF, sandwich rétinol...)
- 5 objection handlers onboarding (burnout 10 steps, tret irritation, color analysis regret...)

### 1.5 Suivi visuel v0 (Sem. 7-8)

- Photo jour 1 / 7 / 14 / 30 (local first, opt-in cloud)
- Slider before/after privé
- Pas de score "beauté" : score = **adhérence routine** (% tâches complétées)

### Critère de sortie Phase 1
- 100 beta users US, onboarding complet < 7 min, rétention J7 > 25%

---

## Phase 2 — Différenciation (Semaines 9-14)

### 2.1 Colorimétrie IA (Sem. 9-11)

- Quiz or/argent (écran lumière calibrée)
- Analyse selfie : sous-ton, contraste, clarté
- Output : saison 12 tones + palette maquillage 5 couleurs
- **Whitespace** : alternative abordable au draping à $300 (verbatim objection)

### 2.2 Module Body Glow (Sem. 11-12)

Pilier différenciant vs apps skincare classiques :
- `body_chafe_prevent`
- `body_fold_care`
- `body_hydration_layer`
- `stretch_mark_comfort`

Copy : "Your body deserves the same attention."

### 2.3 Post-transformation track (Sem. 12-13)

Sans mentionner GLP-1 :
- Track "Skin through change" : peptides, SPF, rétinal doux, hydratation
- Cible : femmes 35-55 US (15 % sur GLP-1, KFF 2025)

### 2.4 Contenu éducatif in-app (Sem. 13-14)

- Cards "Myth vs fact" : cortisol face, slugging, hair oiling
- Format 30 sec lecture, sources citées

### Critère de sortie Phase 2
- Feature colorimétrie utilisée par 40 % des nouveaux users
- Body care tasks complétées 2x/semaine en moyenne (segment persona)

---

## Phase 3 — Monétisation & Scale (Semaines 15-24)

### 3.1 Modèle économique

| Stream | Mécanisme |
|---|---|
| Abonnement GlowScore Pro | Plans 30/90 jours, colorimétrie IA, suivi avancé |
| Affiliation produits | Commission Amazon/Sephora/iHerb |
| Partenariats marques mid-tier | K-beauty, body care inclusif |

**Pricing hypothèse US**
- Free : 1 pilier, plan 7 jours, reco budget only
- Pro $9.99/mois ou $49/an : multi-piliers, colorimétrie, body care, historique photos

### 3.2 Expansion géo

| Marché | Adaptation |
|---|---|
| US | Launch, persona plus size, Amazon affilié |
| UK | Copy EN, Boots/Sephora UK, £ pricing |
| FR | Traduction copy, Sephora FR, ton plus éducatif dermato |

### 3.3 Devices & premium (optionnel P3)

- Recommandation LED / gua sha en tier premium uniquement
- Jamais en prérequis du plan gratuit
- Article "Are $500 masks worth it?" pour gérer méfiance

### 3.4 Moteur reco v2

- Scoring produits par `mention_count` communauté + budget fit + marché
- A/B copy routines (titres verbatim vs adaptés)
- Feedback loop : "Did this product work?" → ajuster règles

---

## Matrice priorisation features

| Feature | Impact | Effort | Priorité | Phase |
|---|---|---|---|---|
| Quiz → plan 7 jours | Très haut | Moyen | P0 | 1 |
| Debloat AM routine | Très haut | Faible | P0 | 1 |
| Barrier repair track | Très haut | Faible | P0 | 1 |
| Reco produits affiliés | Haut | Moyen | P0 | 1 |
| Body care (chafing/folds) | Très haut | Faible | P0 | 1 |
| Colorimétrie 12 saisons | Haut | Élevé | P1 | 2 |
| Suivi photo | Moyen | Moyen | P1 | 1 |
| Post-weight-loss track | Haut | Faible | P1 | 2 |
| Cheveux cuir chevelu | Moyen | Faible | P2 | 2 |
| Anti-âge rétinal progressif | Moyen | Moyen | P2 | 3 |
| Devices LED/Oura | Faible | Faible | P3 | 3 |

---

## KPIs par phase

| Phase | KPI | Cible |
|---|---|---|
| 0 | Règles reco testées | 50/50 pass |
| 1 | Onboarding completion | > 70 % |
| 1 | Rétention J7 | > 25 % |
| 1 | Tâches/jour complétées | > 1.5 |
| 2 | Conversion Free → Pro | > 5 % |
| 2 | Clic affiliation / user actif | > 0.3/semaine |
| 3 | MRR US | $10k |
| 3 | NPS | > 40 |

---

## Risques et mitigations

| Risque | Mitigation |
|---|---|
| Claims médicaux (cortisol, GLP-1) | Review copy legal, glossaire interdit |
| Burnout beauté (trop d'étapes) | Hard cap 5 steps/routine en v1 |
| Méfiance devices chers | Tier premium optionnel, contenu éducatif |
| Body shame | Copy empowerment, modèles inclusifs |
| Données selfies | Local-first, politique privacy claire |
| Cannibalisation apps fitness | Positionnement "beauty only, any size" |

---

## Prochaines actions immédiates

1. **Créer `glowPlan.ts`** avec les 13 FOCUS_TASKS MVP + steps détaillés
2. **Importer `reco-rules-50.json`** dans le moteur de règles
3. **Wireframe onboarding** 7 écrans (Figma ou canvas)
4. **Sélectionner 20 SKU affiliés** US avec liens Amazon Associates
5. **Rédiger pages légales** : disclaimer bien-être, privacy selfies
6. **Beta liste** : 50 users r/PlusSize + r/AsianBeauty + r/30PlusSkinCare

---

## Index fichiers recherche

```
marketing-knowledge/glowscore/
├── cartographie-glow-up-us-fr-uk.md    # Rapport complet Gemini
├── reco-rules-50.json                  # Moteur reco
├── ROADMAP-GLOWSCORE.md                # Ce fichier
├── persona-us-plus-size-research.md  # Persona US obésité/glow-up
└── contenu-beaute-prompts.md           # Prompts Manus/Gemini (copie)
```
