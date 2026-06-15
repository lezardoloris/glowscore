# Prompt — Scraper les blogs/contenus beauté pour les recommandations glow-up

But: récolter ce que les femmes veulent vraiment comme conseils de glow-up (skincare, colorimétrie, anti-âge, de-bloat, maquillage), pour nourrir le moteur de recommandations de GlowScore (routines, produits, plans). À coller dans un agent web (Manus/Perplexity/Gemini Deep Research). Langue: français. Pas de tirets cadratins.

---

```
Tu es analyste contenu beauté + product researcher. Objectif: cartographier de façon SOURCEE ce que les femmes (US en priorité, puis FR/UK) cherchent, attendent et appliquent comme conseils de "glow-up", afin d'alimenter le moteur de recommandations d'une app (routines, produits, plans d'action). Tu peux naviguer le web et scraper des pages publiques.

SOURCES A COUVRIR (publiques)
- Blogs et médias beauté: Byrdie, Allure, Refinery29, PureWow, NewBeauty, Into The Gloss, Healthline (skin), The Klog (K-beauty), Cosmopolitan, ELLE/Glamour beauty.
- Communautes: Reddit r/SkincareAddiction, r/AsianBeauty, r/30PlusSkinCare, r/Splendida, r/Vindicta, r/Makeup, r/femalefashionadvice, r/coluanalysis.
- Social: TikTok et Instagram (hashtags #glassskin #skincycling #cortisolface #coloranalysis #latte makeup #skinlongevity), YouTube (routines GRWM, "skincare for beginners").
- Marketplaces (signaux produits): best-sellers skincare Sephora/Amazon/iHerb + avis.

POUR CHAQUE THEME (peau/glass skin, colorimetrie, anti-age/longevite, de-bloat/cortisol, cernes, maquillage correctif, cheveux), EXTRAIS
1. Les QUESTIONS recurrentes posees (verbatims reels + frequence relative).
2. Les RESULTATS attendus ("ce que je veux": ex. "glass skin sans fond de teint", "savoir ma saison", "degonfler le matin").
3. Les CONSEILS/ROUTINES les plus repris (etapes, ordre d'application, frequence) avec consensus vs debats.
4. Les INGREDIENTS/ACTIFS cles cites (retinol, niacinamide, vit C, SPF, PDRN, peptides) + regles de compatibilite et erreurs frequentes.
5. Les PRODUITS concrets recommandes (marque + nom + budget) les plus cites, avec la source.
6. Les OBJECTIONS/peurs (irritation, perte d'argent, instabilite des resultats, donnees/selfies).
7. Les DECLENCHEURS emotionnels et le vocabulaire exact employe (pour la copy in-app).

LIVRABLES
- Un tableau "Theme -> top 10 questions -> resultat attendu -> conseil consensus -> produits cites -> source".
- Une liste de 40-60 "regles de recommandation" actionnables (si concern X et type de peau Y alors recommander Z), prete a coder dans un moteur de reco.
- Une liste de 30 ingredients/actifs avec: a quoi ils servent, concern cible, frequence, incompatibilites.
- 20 formulations de copy in-app (titres de routine, micro-conseils) reprenant le vocabulaire reel.
- Synthese: les 10 attentes #1 des femmes en glow-up, classees par frequence, et les 5 pieges a eviter.

CONTRAINTES
- Cite source + date de chaque donnee; separe faits sources et estimations.
- Reste bien-etre/cosmetique (jamais medical/diagnostic).
- Pas de tirets cadratins, pas de "---" dans les textes livres.
```

---
### Usage
Manus pour le scraping + tableur; Gemini Deep Research pour la synthese. Le livrable nourrit `glowPlan.ts` (FOCUS_TASKS, produits) + le moteur de reco produits (affiliation) + la copy des routines.
