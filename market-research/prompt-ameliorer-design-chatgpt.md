# Prompt ChatGPT — Améliorer le design de GlowScore (mockups premium, par persona + produits)

À coller dans ChatGPT (avec génération d'images activée pour les mockups, ou en mode texte pour les specs). But: élever le design de l'app vers un premium "clinical-luxe", écran par écran, ancré sur nos personas et nos features. Joins des captures de tes écrans actuels (home, reveal, concerns, plan). Style demandé: pas de tirets cadratins.

---

```
Tu es Lead Product Designer (mobile, iOS) spécialisé dans les apps beauté/wellness premium (réfs: Aura, Cal AI, Glow Recipe, Sephora, Oura). Tu maîtrises l'UI clinical-luxe féminine, les design systems, la hiérarchie visuelle, la profondeur (ombres douces, glassmorphism léger), la typo et le motion.

MISSION
Élever le design de mon app "GlowUp / GlowScore" vers un premium haut de gamme, crédible et désirable, écran par écran, en gardant la marque. Je te joins des captures de l'état actuel. Pour chaque écran: critique précise + refonte + (si tu peux générer des images) un mockup haute-fidélité photoréaliste de l'écran refait au format iPhone (1320x2868, ratio 19.5:9).

CONTEXTE PRODUIT
- App: glow-up / "looksmaxxing féminin" clinical-luxe, cible 100% femmes US adultes.
- Logo: badge rose "💋 GlowUp". Ton: bienveillant, premium, jamais agressif/incel, jamais médical.
- Modèle: hard paywall (12,99$/sem, 59,99$/an, 99,99$ à vie). Funnel type Aura: quiz -> scan -> score "Facial Harmony ??/100" flouté -> paywall -> plan.

CHARTE ACTUELLE (à raffiner, pas à jeter)
- Palette: fond #F9E0E8, panel #FBEAF0, carte #FFFFFF, bordure #F2C4D2, rose principal #E0537A, rose doux #F8D4DF, texte #2D2330, texte doux #8A7B85, vert succès #2E9E5B.
- Esthétique: rose "clinical-luxe", coins arrondis, ombres douces, cartes blanches sur fond rose.

PERSONAS PRIORITAIRES (adapte chaque écran à elles)
1. Glass Skin Devotee (18-30): obsédée skincare, veut une peau "glass skin", suit sa progression chaque semaine. Cherche crédibilité dermatologique et preuve (before/after, courbe).
2. Color Analysis Purist (18-34): veut sa saison colorimétrique exacte, très partageable (TikTok/Pinterest). Sensible au beau, au "drape reveal".
3. Corporate Ascender (22-28): veut une image pro "clean girl / quiet luxury", rapide le matin.
(Secondaires: future mariée, pro-aging, maquillage correctif.)

NOS PRODUITS / FEATURES (le design doit les mettre en valeur)
- Scan visage -> "Facial Harmony" score + sous-scores (skin, symétrie, yeux, mâchoire, nez-lèvres, harmonie).
- Maxed-Out Self (before/after IA, identité préservée).
- Stress-Faciomètre / De-Bloat (cortisol face, index, projection 7 jours, massage guidé).
- Color Season (saison + palette + lip/blush + contraste).
- Visual Weight (soft vs striking + tips maquillage).
- Chrono-Skincare (routine AM/PM circadienne).
- Concern picker (têtes 3D féminines, glow rose: breakouts, cernes, puffiness, asymétrie, rougeurs, ridules).
- Glow-up plan par persona (tâches groupées par catégorie, streak).
- Studio: Glow Up Styles, Makeup, Hair, Relight, Headshot, Age, Fit.

CE QUE JE VEUX (livrables)
1. DIRECTION VISUELLE: une montée en gamme de la charte (raffinement palette + accents métalliques rose-gold, profondeur, glassmorphism subtil, micro-textures), typographie (propose 1 display + 1 texte, ex. Fraunces/Canela + Inter/Geist) avec échelle de tailles, système d'ombres et de rayons, style d'iconographie, style de motion (transitions, reveal).
2. DESIGN SYSTEM concret: tokens (couleurs, espacements 4-pt, rayons, ombres), composants clés (carte, CTA, chip, score-ring, swatch, tab bar, paywall tiles) avec specs.
3. REFONTE ECRAN PAR ECRAN (home, scan/AnalysisLoader, reveal Facial Harmony, concerns, glow-plan, paywall, Color Season): pour chacun, 3 problèmes actuels + la version refaite + pourquoi ça sert tel persona + un mockup généré haute-fidélité.
4. Le HOME en priorité (cf capture): rendre le score-ring plus premium, hiérarchiser les CTA, soigner le bandeau marque, ajouter de la profondeur sans charger.
5. Une planche "avant/après design" et 3 variantes de direction (ex: "Clinical Luxe", "Soft Glow", "Editorial Rose") pour que je choisisse.

CONTRAINTES
- Reste Apple-safe (pas de note d'attractivité agressive, framing bien-être), 100% féminin, cohérent avec la palette rose.
- Lisibilité et contraste AA (texte sur rose).
- Pas de tirets cadratins dans tes textes.
- Donne des valeurs exactes (hex, px, poids de typo) pour que ce soit implémentable en React Native directement.

Commence par: (a) la direction visuelle + design system, puis (b) le HOME refait avec mockup, puis enchaîne les autres écrans.
```

---
### Usage
- Active la génération d'images dans ChatGPT pour les mockups, sinon il te rendra des specs détaillées implémentables.
- Joins tes captures (home, reveal, concerns, plan). Une fois la direction validée, on traduit les tokens en `src/theme.ts` + composants.
