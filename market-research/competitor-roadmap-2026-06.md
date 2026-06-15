# Roadmap concurrentielle GlowScore (d'après les screenshots APP GLOW UP)

Source: `C:\Users\tirakninepeiijub\Documents\APP GLOW UP` (GlowUp Daily, Mogged, Aura, Play Store, 2026-06-10). Objet: pour chaque pattern concurrent, notre adaptation UX/design/produit selon nos personas féminines (Glass Skin, Color Analysis, Corporate). Style: pas de tirets cadratins. Réf: [[gemini-deep-research-rapport-strategique-2026-06]], [[etude-differenciation-stress-faciometre-2026-06]].

## Principe de design
Les concurrents masculins (Mogged) = **dark + glow violet**, vocabulaire incel (Hunter eyes, mog, PSL). Nous = **clinical-luxe rose**, vocabulaire bien-être. On garde leurs mécaniques de conversion (scan wow, reveal flouté, concerns 3D, hard paywall, invite) mais en **féminin + rose + bienveillant**. Un écran "diagnostic" dark premium (charcoal + glow rose) est autorisé comme moment fort (cf concerns).

## Mapping écran par écran

### 1. 3D Face Scanner (Mogged / GlowUp Daily) — AR mesh "turn head", masque 3D, score flouté + "Unlock my ratings"
- **Eux:** caméra live, mesh bleu 468 points, instructions "Turn head slowly to LEFT", barre 33% → masque 3D low-poly (zones colorées) + "Overall Score ??/10" flouté + "Unlock my ratings".
- **Nous (à construire):** scan AR féminin rose. Capture guidée (face → gauche → droite), overlay FaceMesh rose, puis **reveal d'un "face map" 3D** avec GlowScore flouté → paywall. C'est LE moment wow d'acquisition qui nous manque (on a le reveal Aura mais pas le scan 3D animé).
- **Tech / github:** `react-native-vision-camera` (frame processor) + **MediaPipe Face Mesh / Face Landmarker** (Google, github `google-ai-edge/mediapipe`, 468 pts) OU `react-native-vision-camera-face-detector` (déjà installé, v1.7) pour les landmarks; overlay via `@shopify/react-native-skia`; masque 3D via `expo-gl` + `three.js` (`expo-three`) ou un mesh low-poly animé. iOS natif: ARKit `ARFaceTrackingConfiguration` (1220 pts) le plus précis. Sur web: MediaPipe Tasks Vision (JS). **Pas open-source clé en main de l'app entière**, mais toutes les briques existent (MediaPipe + Skia + three). Statut: P1, natif d'abord (beta), web = animation "vecteurs tracés" (déjà prévu).
- **Persona:** P1 Glass Skin + toutes (le scan wow = acquisition). Cadrage bien-être (pas de note d'attractivité chiffrée → "Skin & Harmony map").

### 2. Concern selector 3D (Mogged: têtes purple "Weak jawline / Double chin / Bloated face / Asymmetry / Acne / Eye bags")
- **Nous: FAIT** → `app/concerns.tsx`, têtes 3D **féminines** à glow **rose**, concerns féminins (Breakouts, Dark circles, Puffiness, Asymmetry, Redness, Fine lines), multi-select dark premium, feeds le plan. Reste: brancher les concerns → focus du glowPlan (mapping `focus` déjà dans `concernHeads.ts`).

### 3. Reveal "Your Facial Harmony ??/100" + métriques cadenassées + "Unlock Your Glow Up" / "invite 3 friends" (Aura)
- **Nous: FAIT** (`scan-result.tsx`, clone Aura rose). OK.

### 4. "Pick Your Glow Up": Surgical / Non-surgical / Makeup (Aura)
- **Nous: FAIT** (onboarding, glowUpType). OK.

### 5. "Your Glow Up Plan": treatments cadenassés + Impact (Aura)
- **Nous: FAIT** (reveal treatments + glow-plan par persona). OK.

### 6. Before / After (Max Glow-Up)
- **Nous: FAIT en local** (Gemini, tous styles). **BUG sur Vercel = identique** car le Worker n'est pas déployé (WORKER_BASE_URL placeholder → simulation). **Fix: déployer le Worker (`wrangler deploy` + secrets) + var `WORKER_BASE_URL` dans Vercel.** Sans ça, before == after sur l'URL publique.

### 7. Onboarding quiz long (Aura: 11+ étapes, perception de valeur) + AnalysisLoader
- **Nous: FAIT** (quiz rose + AnalysisLoader multi-étapes). OK.

## Roadmap priorisée (issue des images, par persona)

### P0 (déblocage / déjà en cours)
- **Déployer le Worker** → before/after réel sur Vercel + Color/Visual réels (LLM key). Sinon tout est simulé en public.

### P1 — Le scan "wow" qui manque (acquisition)
- **3D Face Scanner AR** (pattern Mogged/GlowUp Daily) rose + féminin: capture guidée + mesh rose + face-map 3D + score flouté → paywall. Natif d'abord.
- Brancher **concerns → glowPlan** (le `focus` est déjà mappé) pour un plan vraiment adaptatif.

### P1 — Profondeur produit par persona (issue des concerns)
- P1 Glass Skin: face-map peau (zones acné/cernes/rougeurs) façon "Face Maps", lié au scan.
- P2 Color: garder Color Season comme scan parallèle (palette = "ratings" partageables).
- P3 Corporate: "office-ready" before/after (Headshot + clean makeup) en sortie de scan.

### P2 — Polish premium (issu du design concurrent)
- Moments "diagnostic" dark premium cohérents (concerns + scan), transitions, haptics.
- Badges/streak quotidiens (GlowUp Daily tasks/badges).
- Cartes "ratings" partageables (le flouté + unlock = boucle virale).

## Anti-patterns à NE PAS copier
- Vocabulaire incel/masculin (Hunter eyes, mog, PSL, "remove neck fat").
- Note d'attractivité chiffrée brute /10 sur le visage (risque Apple 1.2) → garder le cadrage "harmony/skin" + plancher + bien-être.
- Têtes/visages masculins, glow violet agressif → rose féminin.
