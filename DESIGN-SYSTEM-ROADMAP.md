# GlowUp / GlowScore — Roadmap d'implémentation du design "Clinical Luxe" (mockup ChatGPT)

Traduction complète du design system + refontes écran-par-écran fournis par ChatGPT, en plan d'implémentation React Native concret. Statut: ✅ fait / 🟡 partiel / ⬜ à faire. Style: pas de tirets cadratins.

## 0. Direction
"Science. Skin. You." Premium, bienveillant, personnalisé. 3 piliers affichables (onboarding/paywall): Fiable (données & preuves), Personnalisé (IA + expertise), Inspirant (évolution continue).

---

## 1. DESIGN SYSTEM (fondation)

### 1.1 Palette ✅ (dans `src/theme.ts`)
Primary #E0537A · Rose Soft #F8D4DF · Blush #FDEAF1 · Cream #FFF7F9 · Text Dark #2D2330 · Text Muted #8A7B85 · Success #2E9E5B · Rose Gold #FFC1CC. CTA gradient `pinkGrad` [#E0537A,#EC7FA0].

### 1.2 Typographie ✅
- Display = **Fraunces** (Google, alternative Canela). UI = **Inter**.
- `src/typography.ts` + chargement dans `app/_layout.tsx` (useFonts + SplashScreen).
- Appliqué sur: Home, Paywall, Plan, Concerns, Loader, Studio, Progress, Settings, scan-result (partiel).

### 1.3 Rayons ✅ (`radii` 8/12/16/24/32/full) — appliqué sur écrans refaits.

### 1.4 Ombres ✅
- `src/shadows.ts` (elevation 1/2/3 + glass + ctaShadow). Utilisé sur Home, Paywall, Plan, Concerns, Studio, Progress, Settings.

### 1.5 Iconographie ✅ — line icons Ionicons rose. Icônes features = images générées.

### 1.6 Motion & Feel 🟡
- ✅ Haptics `impactLight` + `impactMedium` sur taps clés.
- ✅ Reveal blur → clarté (scan-result: score flouté + défloutage avatar à l'unlock).
- ✅ Confetti succès (`SoftConfetti` à l'unlock).
- ✅ Breathing gradient loader (`BreathingBackground`).
- 🟡 Transitions Stack 300ms (défaut expo-router, affiner si besoin).

---

## 2. REFONTES ÉCRAN PAR ÉCRAN

### 2.1 HOME ✅
Carte hero + typo Fraunces/Inter + ombres centralisées.

### 2.2 SCAN / ANALYSE (LOADER) ✅
Ring agrandi, mesh visible, "120+ points", checklist mockup, "Stay natural, no filter", breathing gradient.

### 2.3 REVEAL – FACIAL HARMONY ✅
Score flouté, copy unlock mockup, dots carousel, confetti + défloutage à l'unlock, CTA "Unlock now" + "Included in GlowUp Premium".

### 2.4 CONCERNS ✅
Grille 3x3 (9 têtes), cap max 5 + compteur, fond Clinical Luxe rose clair.

### 2.5 GLOW-UP PLAN ✅
Résumé par catégorie avec % + sélecteur jours L M M J V S D + streak.

### 2.6 COLOR SEASON ✅
Neutres / Accents / Makeup + lip 12 / blush 8 + carte partage 9:16.

### 2.7 PAYWALL ✅
Checklist bénéfices + 3 tuiles prix + garantie 7 jours + design system.

### 2.8 STUDIO / PROGRESS / ME ✅
Typo + ombres + cartes alignées design system.

---

## 3. LES 3 VARIANTES DE DIRECTION
`themeVariants` exposé dans `src/theme.ts` (Clinical Luxe défaut). Switch UI A/B: ⬜ à faire plus tard.

---

## 4. ORDRE DE BUILD (complété)
1. ✅ Polices + typography + shadows
2. ✅ Paywall
3. ✅ Plan + Color Season
4. ✅ Concerns + Reveal + Loader
5. ✅ Motion + reskin Studio/Progress/Me

## 5. NOTES
- 3 têtes concerns (texture, dryness, sagging): placeholders PNG copiés; remplacer par assets 3D générés quand prêts.
- Note OCR: "Rose Soft #FBD40F" du mockup = jaune lu par erreur; retenu #F8D4DF.
