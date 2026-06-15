# GlowUp / GlowScore — Roadmap d'implémentation du design "Clinical Luxe" (mockup ChatGPT)

Traduction complète du design system + refontes écran-par-écran fournis par ChatGPT, en plan d'implémentation React Native concret. Statut: ✅ fait / 🟡 partiel / ⬜ à faire. Style: pas de tirets cadratins.

## 0. Direction
"Science. Skin. You." Premium, bienveillant, personnalisé. 3 piliers affichables (onboarding/paywall): Fiable (données & preuves), Personnalisé (IA + expertise), Inspirant (évolution continue).

---

## 1. DESIGN SYSTEM (fondation)

### 1.1 Palette ✅ (dans `src/theme.ts`)
Primary #E0537A · Rose Soft #F8D4DF · Blush #FDEAF1 · Cream #FFF7F9 · Text Dark #2D2330 · Text Muted #8A7B85 · Success #2E9E5B · Rose Gold #FFC1CC. CTA gradient `pinkGrad` [#E0537A,#EC7FA0].

### 1.2 Typographie ⬜ (polices custom à charger)
- Display (titres) = **Canela** (payante) → alternative gratuite **Fraunces** (Google). H1 34/40 600, H2 28/34 600, H3 22/28 600.
- Texte (UI) = **Inter**. Body1 16/24 400, Body2 14/20 400, Caption 12/16 500.
- Tâches: `npx expo install expo-font @expo-google-fonts/fraunces @expo-google-fonts/inter`, charger dans `_layout.tsx` (useFonts), créer `src/typography.ts` (styles h1/h2/h3/body/caption), remplacer les `fontWeight/fontSize` ad hoc par ces tokens dans tous les écrans.

### 1.3 Rayons 🟡 (`radii` ajouté: 8/12/16/24/32/full) — à appliquer partout (cartes 24, chips 12, CTA full/30).

### 1.4 Ombres ⬜ (système à centraliser)
- Elevation 1: 0 2 8 rgba(45,35,48,.06) · Elevation 2: 0 8 24 rgba(45,35,48,.08) · Elevation 3: 0 16 40 rgba(45,35,48,.10) · Glass: 0 8 30 rgba(255,255,255,.4) + blur.
- Tâche: créer `src/shadows.ts` (helpers cross-platform web/native, déjà inline sur le home) et l'utiliser partout.

### 1.5 Iconographie 🟡 — line icons Ionicons rose (cohérent). Les icônes de features sont des images générées (styles/concerns). OK.

### 1.6 Motion & Feel ⬜ (le gros manque)
- Transitions 300ms ease-out (Stack animations OK; affiner).
- Micro-interactions: haptics léger sur chaque tap (partiel, `impactMedium` à généraliser).
- **Reveal Blur → Clarté**: le score flouté qui se "défloute" à l'unlock (à animer, react-native-reanimated + blurRadius).
- **Success soft confetti** (ex. à l'unlock / fin de routine) → lib `react-native-confetti-cannon` ou Skia.
- **Loading breathing gradient** (fond animé pendant le scan) → LinearGradient animé / Skia.

---

## 2. REFONTES ÉCRAN PAR ÉCRAN

### 2.1 HOME ✅ (fait, fidèle au mockup)
Carte hero blanche unifiée (ring centré, band "Bon équilibre", "Top X%", série), lignes plan + cortisol, chips "What to work on" + See all, CTA dégradés, 5 onglets. Reste: appliquer la typo Canela/Inter quand chargée.

### 2.2 SCAN / ANALYSE (LOADER) 🟡 → ⬜ à finir
Mockup: ring 78% **autour de la photo avec mesh sur le visage**, "Nous analysons 120+ points de votre visage", checklist (Symétrie, Texture de peau, Proportions, Harmonie globale), "Restez naturelle, sans filtre."
- Fait: AnalysisLoader (ring + scanline + mesh subtil + checklist 7 étapes).
- À faire: agrandir le visage + mesh plus visible (façon mockup), ajouter la ligne "120+ points" et "Restez naturelle, sans filtre", **breathing gradient** en fond.

### 2.3 REVEAL – FACIAL HARMONY 🟡 → ⬜
Mockup: gros score **flouté** 72/100, "Bon équilibre", "Débloquez votre score détaillé et votre plan personnalisé", "Débloquer maintenant", "Inclus dans GlowUp Premium", dots de carousel.
- Fait: clone Aura existant (`scan-result.tsx`, ring + métriques cadenassées + invite 3 friends).
- À faire: aligner sur la nouvelle carte blanche + typo, animer le **blur → clarté** à l'unlock, soigner le carousel de dots.

### 2.4 CONCERNS 🟡 → ⬜ (étendre de 6 à 9)
Mockup: "Qu'est-ce qui vous préoccupe ? Sélectionnez jusqu'à 5 priorités", grille **3x3** de têtes 3D: Boutons, Cernes, Poches, Asymétrie, Rougeurs, Rides fines, Texture, Sécheresse, Relâchement. "Continuer", compteur "X sélectionnée".
- Fait: 6 têtes (breakouts, dark_circles, puffiness, asymmetry, redness, fine_lines) dark premium.
- À faire: **générer 3 têtes de plus** (Poches, Texture, Sécheresse, Relâchement → choisir/mapper), passer à 9, ajouter le **cap "max 5"** + compteur, titre exact. (Option: passer le fond en rose clair vs dark selon variante.)

### 2.5 GLOW-UP PLAN 🟡 → ⬜ (regrouper par catégorie + % + sélecteur de semaine)
Mockup: "Mon plan Glow-Up", "Semaine 1/12", **lignes par catégorie avec barre de %** (Peau 3 tâches 87%, Stress & Dégonflement 2 tâches 60%, Teint & Éclat 2 tâches 30%, Maquillage & Style 1 tâche 0%), "Série actuelle 🔥", **sélecteur de jours L M M J V S D**.
- Fait: plan par persona groupé par catégorie + streak + progress global.
- À faire: vue "résumé par catégorie avec % de complétion" + **sélecteur de jour de la semaine** (historique de complétion par jour), libellés FR/EN cohérents.

### 2.6 COLOR SEASON 🟡 → ⬜ (enrichir la sortie)
Mockup: "Votre saison / Été Doux / Soft Summer", grille palette, **"Vos meilleures couleurs" en 3 colonnes (Neutres / Accents / Maquillage)**, "Rouge à lèvres 12 teintes", "Blush 8 teintes", "Partager ma saison".
- Fait: saison + sous-saison + undertone + palette + lip/blush + contraste + partage.
- À faire: regrouper la palette en **Neutres / Accents / Maquillage**, afficher des séries de teintes (rouge à lèvres / blush), carte "Partager ma saison" 9:16.

### 2.7 PAYWALL ⬜ (refonte complète selon mockup)
Mockup: "Débloquez tout votre potentiel GlowUp", **checklist de bénéfices** (Score détaillé & insights, Plan personnalisé illimité, Tous les outils IA Studio, Suivi de progression avancé, Mises à jour hebdomadaires), **3 tuiles prix** (Hebdo 12,99 · Annuel 59,99 "Populaire" · À vie 99,99 "Meilleur prix"), "Continuer", **"Garantie 7 jours satisfait ou remboursé"**.
- Fait: pricing.tsx (3 tuiles, annuel best value, prix à jour).
- À faire: ajouter la **checklist de bénéfices** en haut + la ligne **garantie 7 jours** + alignement design system (carte, ombres, typo).

### 2.8 STUDIO / PROGRESS / ME ⬜
Aligner Studio (feature-hub), Progress (history) et Me (settings) sur le design system (cartes, ombres, typo, en-têtes). Studio: grille d'outils déjà OK, à reskinner.

---

## 3. LES 3 VARIANTES DE DIRECTION (à trancher)
Le mockup propose 3 ambiances de fond pour le home:
1. **Clinical Luxe** (rose clair, actuel) — défaut.
2. **Soft Glow** (pêche/abricot plus chaud).
3. **Editorial Rose** (rose profond/dramatique).
- Tâche: garder Clinical Luxe par défaut, exposer un switch de thème (variante) plus tard pour A/B. Décision produit à valider.

---

## 4. ORDRE DE BUILD RECOMMANDÉ
1. **Polices** (Fraunces + Inter) + `typography.ts` + `shadows.ts` → base qui élève tous les écrans d'un coup.
2. **Paywall** refondu (checklist + garantie) → impact conversion direct.
3. **Plan** par catégorie + sélecteur de semaine + **Color Season** enrichi (Neutres/Accents/Maquillage).
4. **Concerns** 9 têtes + cap 5. **Reveal** blur→clarté. **Loader** mesh + 120 points + breathing gradient.
5. **Motion**: confetti succès + haptics généralisés. Studio/Progress/Me reskin.

## 5. CE QUI EST DÉJÀ FAIT (rappel)
✅ Tokens palette + radii + gradient · ✅ Home refait (carte hero) · ✅ 5 onglets · ✅ Logo GlowUp · ✅ Concerns (6 têtes) · ✅ AnalysisLoader (mesh subtil) · ✅ Color Season / Visual Weight / Chrono (écrans de base) · ✅ Icônes premium styles.

Note OCR: "Rose Soft #FBD40F" du mockup est lu comme du jaune; c'est un rose doux (#F8D4DF retenu).
