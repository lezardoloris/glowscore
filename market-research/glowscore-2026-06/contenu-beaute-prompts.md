# GlowScore — prompts recherche contenu beauté / glow-up

> Objectif : cartographier ce que les femmes (US prioritaire, puis FR/UK) cherchent, attendent et appliquent comme conseils de glow-up, pour alimenter le moteur de recommandations GlowScore (routines, produits, plans d'action).
> Cibles code : `glowPlan.ts` (FOCUS_TASKS), moteur de reco produits (affiliation), copy des routines in-app.
> Langue des livrables : français. Style : pas de tirets cadratins, pas de "---" comme séparateurs dans les textes livrés.

---

## PROMPT 1 — GEMINI DEEP RESEARCH (synthèse sourcée + règles codables)

```
Tu es analyste contenu beauté + product researcher senior. Réalise une cartographie SOURCÉE de ce que les femmes (US en priorité, puis FR/UK) cherchent, attendent et appliquent comme conseils de "glow-up", afin d'alimenter le moteur de recommandations d'une app mobile (routines, produits, plans d'action). Tu peux naviguer le web et consulter des pages publiques.

CONTEXTE PRODUIT
GlowScore est une app de glow-up personnalisé : skincare, colorimétrie, anti-âge, de-bloat, maquillage correctif, cheveux. Le livrable doit être directement exploitable pour coder :
- FOCUS_TASKS dans glowPlan.ts (tâches quotidiennes/hebdo par objectif)
- un moteur de reco produits (affiliation Sephora/Amazon/iHerb)
- la copy in-app (titres de routines, micro-conseils, objections)

THÈMES À COUVRIR (7 piliers)
1. Peau / glass skin / texture / pores
2. Colorimétrie / saisons / teint / maquillage harmonisé
3. Anti-âge / longévité cutanée / "skin longevity"
4. De-bloat / cortisol face / rétention d'eau / contouring naturel
5. Cernes / regard fatigué / éclat du contour des yeux
6. Maquillage correctif / "no-makeup makeup" / latte makeup
7. Cheveux (brillance, volume, cuir chevelu, routine capillaire)

SOURCES À PRIORISER (publiques, 2024-2026)
- Blogs et médias : Byrdie, Allure, Refinery29, PureWow, NewBeauty, Into The Gloss, Healthline (skin), The Klog, Cosmopolitan, ELLE/Glamour beauty
- Communautés : Reddit r/SkincareAddiction, r/AsianBeauty, r/30PlusSkinCare, r/Splendida, r/Vindicta, r/Makeup, r/femalefashionadvice, r/coloranalysis
- Social : TikTok/Instagram (#glassskin #skincycling #cortisolface #coloranalysis #lattemakeup #skinlongevity), YouTube (GRWM, "skincare for beginners")
- Marketplaces : best-sellers skincare Sephora US/FR, Amazon beauty, iHerb + avis récurrents

POUR CHAQUE THÈME, EXTRAIS ET STRUCTURE
1. QUESTIONS récurrentes (verbatims réels + fréquence relative : très fréquent / fréquent / émergent)
2. RÉSULTATS attendus ("ce que je veux" : ex. "glass skin sans fond de teint", "savoir ma saison", "dégonfler le matin")
3. CONSEILS / ROUTINES les plus repris (étapes, ordre, fréquence) : consensus vs débats actifs
4. INGRÉDIENTS / ACTIFS clés (rétinol, niacinamide, vit C, SPF, PDRN, peptides, AHA/BHA, azelaic acid, ceramides...) + compatibilité et erreurs fréquentes
5. PRODUITS concrets (marque + nom + fourchette budget €/$) les plus cités, avec source
6. OBJECTIONS / peurs (irritation, perte d'argent, instabilité des résultats, données/selfies, "overwhelmed by steps")
7. DÉCLENCHEURS émotionnels et vocabulaire exact (pour copy in-app)

LIVRABLES ATTENDUS

A) TABLEAU MAÎTRE (markdown ou CSV)
Colonnes : Theme | Top 10 questions (verbatim) | Résultat attendu | Conseil consensus | Produits cités (top 5) | Source + date

B) 40-60 RÈGLES DE RECOMMANDATION actionnables, format strict pour moteur de reco :
   SI [concern] ET [type_peau ou profil] ET [contrainte optionnelle] ALORS [routine_step ou produit_category ou ingrédient] PARCE QUE [raison courte]
   Exemple : SI concern=pores_visibles ET type_peau=grasse ET contrainte=débutante ALORS recommander niacinamide 5-10% le matin PARCE QUE consensus r/SkincareAddiction + Byrdie 2024

C) 30 INGRÉDIENTS / ACTIFS avec : nom | à quoi il sert | concern cible | fréquence d'usage | incompatibilités | niveau preuve (consensus fort / débat / émergent)

D) 20 FORMULATIONS COPY in-app reprenant le vocabulaire réel des communautés :
   - 10 titres de routine (ex. "Routine glass skin 7 jours")
   - 10 micro-conseils push/notif (max 80 caractères)

E) SYNTHÈSE EXÉCUTIVE
   - Top 10 attentes #1 des femmes en glow-up, classées par fréquence
   - Top 5 pièges à éviter (erreurs produit, sur-consommation, allégations trompeuses)
   - 5 tendances émergentes 2025-2026 à intégrer dans la roadmap produit

EXIGENCES
- Cite source + date de chaque donnée ; sépare clairement faits sourcés vs estimations (et méthode d'estimation)
- Reste bien-être / cosmétique : jamais diagnostic médical, jamais prescription
- Langue : français
- Pas de tirets cadratins, pas de "---" dans les textes livrés
```

---

## PROMPT 2 — MANUS (scraping opérationnel + exports exploitables)

```
Mission : produire des livrables OPÉRATIONNELS et des fichiers exploitables (CSV, tableur) sur les contenus beauté / glow-up, pour alimenter GlowScore. Tu peux naviguer le web, scraper des pages publiques, consulter Reddit, TikTok (pages publiques), YouTube, et les marketplaces.

CONTEXTE
GlowScore = app glow-up personnalisé. Les exports doivent pouvoir être importés dans glowPlan.ts (FOCUS_TASKS), le catalogue produits affiliés, et les templates de copy routines.

LIVRABLES À PRODUIRE (artefacts, pas seulement du texte)

1. MATRICE THÈMES x QUESTIONS (CSV)
   - 7 thèmes (peau, colorimétrie, anti-âge, de-bloat, cernes, maquillage, cheveux)
   - Pour chaque thème : top 15 questions en verbatim (titre Reddit, commentaire haut-voté, titre article)
   - Colonnes : theme | question_verbatim | source_url | source_type (reddit/blog/tiktok/youtube/sephora) | date | frequence_relative (1-5) | langue (EN/FR)

2. CATALOGUE PRODUITS CITÉS (CSV)
   - Scrape / compile les 50 produits skincare + 30 maquillage les plus recommandés sur :
     * Sephora US best-sellers skincare (top 30 par catégorie : serum, moisturizer, SPF, cleanser)
     * Amazon "most wished" / best-seller beauty (top 20)
     * Threads Reddit r/SkincareAddiction + r/AsianBeauty "holy grail" récurrents (top 30)
   - Colonnes : brand | product_name | category | concern_tags | price_usd | price_eur_est | mention_count | sources (urls) | budget_tier (budget/mid/premium) | skin_types_cited

3. INGRÉDIENTS x ROUTINES (CSV)
   - 30 actifs avec : ingredient | primary_concern | usage_frequency | am_pm | compatible_with | incompatible_with | beginner_safe (oui/non) | sources

4. VERBATIMS COPY (CSV)
   - 100 phrases réelles extraites des communautés (Reddit, TikTok captions publiques, commentaires YouTube)
   - Colonnes : verbatim | theme | emotion_tag (frustration/espoir/FOMO/confusion) | source_url | usable_for (routine_title/micro_tip/objection_handler)

5. AUDIT REDDIT (document + CSV)
   - Pour r/SkincareAddiction, r/AsianBeauty, r/30PlusSkinCare, r/coloranalysis :
     * Top 20 posts des 12 derniers mois (titre, score, nb commentaires, url)
     * Top 10 "consensus routines" identifiées (AM/PM step-by-step)
     * Top 10 débats actifs (ex. slugging, skin cycling, PDRN, tretinoin vs retinol)

6. AUDIT TIKTOK / INSTAGRAM (document)
   - Hashtags : #glassskin #skincycling #cortisolface #coloranalysis #lattemakeup #skinlongevity #slugging #barrierrepair
   - Pour chaque hashtag : volume approximatif, 5 vidéos/captions représentatives (url), angles récurrents, produits mentionnés

7. RÈGLES DE RECO PRÊTES À CODER (JSON)
   - 40-60 règles au format :
   {
     "id": "reco_001",
     "if": { "concern": "...", "skin_type": "...", "experience": "beginner|intermediate" },
     "then": { "focus_task": "...", "ingredient": "...", "product_category": "...", "routine_slot": "am|pm|weekly" },
     "because": "...",
     "sources": ["url1", "url2"]
   }

8. SYNTHÈSE OPÉRATIONNELLE (document)
   - Top 10 attentes #1 (avec preuve par fréquence de mentions)
   - Top 5 pièges à éviter
   - Mapping suggéré vers FOCUS_TASKS GlowScore (liste de 15-25 tâches candidates avec priorité P1/P2/P3)

CONTRAINTES
- Cite source + date de chaque donnée ; sépare faits vérifiés et estimations
- Sorties : minimum 4 CSV + 1 JSON + 2 documents
- Langue des synthèses : français (verbatims originaux conservés en EN si source EN)
- Pas de tirets cadratins, pas de "---" dans les textes livrés
- Bien-être / cosmétique uniquement, jamais diagnostic médical
```

---

## Mapping vers glowPlan.ts

Quand les deux rapports sont récupérés, fusionner ainsi :

| Livrable agent | Destination code | Champ cible |
|---|---|---|
| Règles JSON (Manus) + règles SI/ALORS (Gemini) | `glowPlan.ts` | `FOCUS_TASKS[]` : id, title, theme, frequency, steps |
| Catalogue produits CSV | moteur reco affilié | `products[]` : brand, name, concern_tags, price_tier, affiliate_slug |
| 30 ingrédients CSV | couche ingrédients | `ingredients[]` : name, concerns, am_pm, incompatibilities |
| 20 formulations copy | UI routines | `routineCopy[]` : title, micro_tip, emotion_hook |
| Verbatims objections | onboarding / paywall | `objectionHandlers[]` : fear, response, source_verbatim |
| Top 10 attentes | priorisation roadmap | ordre des thèmes dans le quiz / plan initial |

### Taxonomie FOCUS_TASKS suggérée (à valider après scrape)

```
skin_glass_routine | skin_barrier_repair | skin_pores_texture
color_season_discovery | color_makeup_palette
antiage_retinol_intro | antiage_spf_daily | antiage_peptides
debloat_morning_routine | debloat_lymphatic | debloat_salt_sleep
eyes_dark_circles | eyes_depuff | eyes_brighten
makeup_no_makeup | makeup_corrective | makeup_latte
hair_shine | hair_scalp | hair_volume
```

---

## PROMPT 3 — GEMINI DEEP RESEARCH (persona US : obésité / transformation visuelle / glow-up)

> Persona prioritaire : femmes US adultes en surpoids ou obèses (~72 % de la population adulte selon CDC NHANES 2021-2023) qui cherchent un glow-up esthétique sans forcément parler de "perte de poids". Contexte marché : boom GLP-1 (Ozempic/Wegovy), culture TikTok debloat/cortisol face, body image polarisée.

```
Tu es analyste senior en stratégie produit beauté + études de marché consumer US. Réalise une recherche approfondie et SOURCÉE (cite chaque donnée avec source + date) sur le persona suivant, afin d'alimenter le positionnement, le quiz d'onboarding et le moteur de recommandations d'une app glow-up (GlowScore).

PERSONA CIBLE (à documenter en profondeur)
"La glow-up seeker US en contexte surpoids/obésité"
- Femmes 25-55 ans, États-Unis, priorité
- Profil pondéral : surpoids (BMI 25-29.9) ou obésité (BMI 30+), soit ~40 % des adultes US obèses + ~32 % en surpoids (CDC NHANES, août 2021-août 2023)
- Ne se définit PAS comme "patiente obèse" dans ses recherches : elle tape plutôt "debloat face", "how to look less puffy", "makeup for round face", "glow up transformation", "Ozempic face skincare"
- Motivation mixte : esthétique + confiance + comparaison sociale (TikTok/Instagram) + parfois post-perte de poids rapide (GLP-1)
- Budget typique : mid-market (Sephora, Amazon, Target), sensible au rapport qualité/prix, méfiante envers les arnaques "fat burning"

CONTEXTE MARCHÉ US À INTÉGRER
- Prévalence obésité adulte ~40,3 %, obésité sévère ~9,4 %, en hausse pour la sévère (CDC, 2024)
- Boom médicaments GLP-1 : phénomène "Ozempic face" (visage creusé, peau relâchée après perte rapide), recherches skincare associées en explosion 2023-2026
- Tension culturelle : body positivity vs "that girl" / hot girl summer / transformation aesthetics
- GlowScore se positionne BIEN-ÊTRE / COSMÉTIQUE / LIFESTYLE uniquement : jamais perte de poids médicale, jamais prescription, jamais diagnostic

STRUCTURE DU RAPPORT (sections obligatoires)

1. FICHE PERSONA DÉTAILLÉE
   - Démographie, psychographie, revenus estimés, canaux digitaux (TikTok, Reddit, YouTube, Pinterest)
   - Jobs-to-be-done (JTBD) : quels "jobs" essaie-t-elle de résoudre via le glow-up ?
   - Déclencheurs d'action (événement, comparaison, miroir le matin, commentaire, post viral)
   - Objections et peurs (honte, arnaques, "nothing works on my face", steps overwhelm, données/selfies)
   - Vocabulaire exact qu'elle utilise (verbatims EN + traduction FR pour copy)

2. CARTOGRAPHIE DES RECHERCHES (SEARCH INTENT)
   Pour chaque cluster, fournis :
   - 15-25 requêtes réelles ou quasi-réelles (Google, TikTok, Reddit, YouTube)
   - Intent : informational / transactional / comparison / community
   - Volume relatif : très élevé / élevé / moyen / émergent (avec méthode d'estimation)
   - Saisonnalité si identifiable

   Clusters obligatoires :
   A) De-bloat / visage gonflé / "cortisol face" / rétention d'eau / jawline
   B) Maquillage visage rond / double menton / contouring / "slimming face" (sans promesses médicales)
   C) Peau du corps (vergetures, frottements, zones plisées, texture, odeur, hyperpigmentation)
   D) Post-transformation / "Ozempic face" / peau relâchée après perte de poids rapide
   E) Glow-up global / transformation esthétique / "that girl routine" / avant-après
   F) Colorimétrie et style (vêtements + maquillage qui "flattent" un visage/corps plus rond)
   G) Cheveux et framing du visage (coupe, volume, illusion de structure)
   H) Erreurs et arnaques qu'elle a déjà essayées (detox teas, waist trainers, "fat burning" creams)

3. COMMUNAUTÉS ET SOURCES OÙ ELLE S'EXPRIME
   - Subreddits : r/PlusSize, r/loseit, r/SkincareAddiction, r/MakeupAddiction, r/30PlusSkinCare, r/Splendida, r/Vindicta, r/femalefashionadvice, r/Ozempic (si pertinent pour skincare post-weight-loss)
   - Hashtags TikTok/Instagram : #debloat #cortisolface #ozempicface #glowup #thatgirl #softglam #makeupforroundface #lymphaticdrainage #bodypositivity
   - Créateurs / médias qui parlent à ce persona (noms + angle)
   - Pour chaque source : type de contenu dominant, ton (empowerment vs aspirational vs medical-adjacent)

4. PROBLÈMES RENCONTRÉS (pain points hiérarchisés)
   Classe par fréquence relative (top 15) :
   - Esthétiques (visage, peau, maquillage, corps)
   - Émotionnels (confiance, comparaison, honte, FOMO)
   - Pratiques (routines trop longues, produits inadaptés, irritations, budget)
   - Post-GLP-1 spécifiques (volume facial perdu, rides accentuées, peau qui pend)
   Distingue : problèmes qu'elle nomme ouvertement vs problèmes implicites (non dits)

5. SOLUTIONS QU'ELLE CHERCHE ET APPLIQUE DÉJÀ
   - Routines matin/soir les plus citées (étapes, ordre, fréquence)
   - Ingrédients / actifs mentionnés pour ce persona (niacinamide, caféine, peptides, rétinol, SPF, acide hyaluronique, vit C)
   - Techniques non-produit : massage lymphatique, glace, gua sha, sel/sommeil, posture photo
   - Produits concrets top 20 (marque + nom + prix USD + source)
   - Consensus vs débats actifs dans les communautés

6. CE QUE GLOWSCORE PEUT FAIRE (recommandations produit)
   - 5 angles de positionnement testables (copy + promesse)
   - 15-20 FOCUS_TASKS candidates pour ce persona (id + titre + description + fréquence)
   - 30 règles SI/ALORS codables, format :
     SI [concern] ET [profil_persona] ET [contrainte] ALORS [routine_step ou catégorie produit] PARCE QUE [source]
   - 10 formulations copy in-app (titres routines + micro-conseils) avec vocabulaire réel du persona
   - Ce qu'il faut ABSOLUMENT éviter (légal, éthique, trust)

7. LANDSCAPE CONCURRENTIEL (apps et contenus)
   - Apps beauté/skincare qui touchent ce persona (Lovi, TroveSkin, FeelinMySkin, etc.)
   - Apps fitness/poids qui "mangent" la demande (Noom, MyFitnessPal) : où est le whitespace pour GlowScore ?
   - Marques DTC et créateurs qui captent ce persona

8. DONNÉES MARCHÉ (chiffrées, sourcées)
   - Taille du marché skincare US + segment "body care" + maquillage correctif
   - Pénétration GLP-1 US (estimations 2024-2026) et impact sur demande skincare/post-weight-loss aesthetics
   - Dépenses beauté moyennes par ménage ou par segment si disponible
   - Tendances Google Trends sur 5 ans : "debloat face", "ozempic face", "glow up", "makeup for round face"

9. SYNTHÈSE EXÉCUTIVE (10 points actionnables)
   - Top 10 recherches #1 de ce persona, classées par fréquence
   - Top 5 opportunités produit pour GlowScore (P1/P2/P3)
   - Top 5 risques (shame marketing, claims interdits, cannibalisation fitness)
   - Recommandation de séquence onboarding quiz pour ce persona

LIVRABLES FORMATÉS
A) Tableau persona : attribut | valeur | source
B) Tableau search intent : cluster | requête | intent | volume relatif | source
C) Tableau pain points : rang | pain | verbatim | fréquence | solution cherchée
D) Tableau produits : brand | product | concern | price_usd | mention_count | source
E) Liste 30 règles de reco (SI/ALORS)
F) 15 FOCUS_TASKS JSON-ready : { "id", "title", "theme", "frequency", "persona_fit": "us_plus_size" }
G) 10 copy lines (EN original + FR adaptation)

EXIGENCES
- Sources récentes prioritaires 2023-2026 : CDC, NIH, Mintel, NPD/Circana beauty, Byrdie, Allure, Refinery29, Healthline, Cleveland Clinic (Ozempic face), Reddit threads, TikTok trend reports
- Distingue clairement faits sourcés vs estimations (méthode explicite)
- Verbatims EN conservés pour le vocabulaire ; synthèse en français
- Bien-être / cosmétique uniquement : pas de plan alimentaire perte de poids, pas de recommandation GLP-1, pas de diagnostic obésité
- Pas de tirets cadratins, pas de "---" dans les textes livrés
- Langue du rapport : français (verbatims EN entre guillemets)
```

---

## Notes d'usage

- **Gemini Deep Research (général)** : colle le Prompt 1 ; valide le plan de recherche proposé, puis laisse compiler. Idéal pour consensus, règles codables, copy et synthèse stratégique.
- **Gemini Deep Research (persona US obésité/glow-up)** : colle le Prompt 3 ; idéal pour fiche persona, search intent, pain points et positionnement GlowScore sur ce segment.
- **Manus** : colle le Prompt 2 ; surveille les premières étapes (scraping Reddit + Sephora best-sellers + export CSV). Corrige le cap si les colonnes ne matchent pas le mapping ci-dessus.
- **Fusion** : une fois les livrables en main, on transforme les CSV/JSON en structures TypeScript pour `glowPlan.ts` et le moteur de reco produits.
