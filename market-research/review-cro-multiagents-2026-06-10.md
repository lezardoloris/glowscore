# Review CRO multi-agents + application (2026-06-10)

3 agents (Produit/Scan/Data · CRO/Funnel/Pricing · Design/Positionnement) ont audité l'app par persona/âge/composant vs concurrents. Findings split: appliqué / codable restant / roadmap. Réfs: [[review-3-agents-2026-06-10.md]], [[diagnostic-composants-visage.md]], [[gemini-deep-research-personas-femmes.md]].

## ✅ APPLIQUÉ cette session (codable, tsc clean)
- **6 vignettes par composant** générées (Higgsfield) + câblées dans les cartes du reveal (visibles avant/après paywall). Assets: `expo-app/assets/components/*.png`.
- **Home = dashboard rose**: dernier GlowScore + streak + plan du jour + "Re-scan to see your progress" (la boucle de rétention enfin visible au retour). Hero première fois avec image. `(tabs)/index.tsx` réécrit.
- **Tab bar rose** + icônes Ionicons (Scan / Progress / Settings). `(tabs)/_layout.tsx`.
- **`src/theme.ts`** token partagé (stop au copier-coller du bloc C, anti-drift).
- **ScanRecord complété** (+ nose_lip_ratio + lip_harmony) → le delta de re-scan couvre les 6 composants, pas 5. `history.ts` + `scan-result.tsx`.
- **Invite-unlock durci**: suppression du "Android toujours completed", cooldown 15s anti 3-taps, message de comparaison ("bet you cannot beat mine"). `inviteUnlock.ts`.
- **Share = pilule visible** (était un lien texte minuscule). `scan-result.tsx`.
- Quick-wins précédents: "5→6 composants", sous-titre loading, stepper 2 pages.

## 🟠 CODABLE RESTANT (prioritisé, à faire ensuite)
1. **Persona-branching** (consensus fort): capturer l'intention du quiz → passer un `focus` au `/api/face-scan` (1 ligne de rubrique) → biaiser treatments + brancher la copie paywall/reveal par persona (Aging "skin-age report", Dating "why your photos read flat", Post-rupture "30-day blueprint"). Quasi gratuit, gros effet "l'IA a lu MON visage".
2. **Re-thème settings / history / feature-hub / glow-plan** en rose (theme.ts). Les 4 derniers écrans sombres.
3. **History → ScanRecord** (timeline GlowScore + delta), pas l'ancien TransformationRecord.
4. **Ring radial sur le reveal** + reveal séquencé (count-up + ring sweep + barres en stagger). LE screenshot App Store.
5. **Treatments: + component + cadence**; plan keyé sur treatments; **delta par composant** ("Skin Clarity +6 cette semaine") = la boucle que personne ne ferme.
6. **Percentile honnête** server-side (courbe déterministe sur overall) au lieu de la confab LLM (fix factuel + BDD).
7. **Paywall trial-forward** (annual défaut avec essai en hero) + 1-2 témoignages persona (rassure F4/F5 haute LTV).
8. **Quiz**: fusionner consentement IA dans l'étape caméra (moins de murs à la fin) + remplacer Surgical/Non-Surgical/Makeup par un picker d'intention persona.
9. **Élaguer feature-hub** de 19 → ~6 features on-brand.
10. **Réordonner les métriques du reveal** par persona (anxiété la plus forte en haut).

## 🔵 ROADMAP (gros chantiers)
- **Maxed-Out Self flouté AVANT le paywall** = levier de conversion #1 (vendre le visage, pas le chiffre). Nécessite génération fal.ai au scan + worker déployé + A/B.
- **Galerie d'options par composant** (3 projections de glow-up / composant). Démarré: 3 options "peau" validées; reste 15 images + écran `component-detail`. = la demande active de l'utilisateur, à finir.
- **Animation de scan** "vecteurs + landmarks + jauge 99%" 7-10s.
- **Skin Tracker** dédié (close-up peau, suivi hebdo, affiliation produits) — persona F4/F2, marché 10Md$.
- **Colorimétrie** récurrente (vs Glam Up one-and-done).
- **Web-to-app checkout** (modèle Cal AI): landing + quiz + Stripe, -30% Apple, data first-party.
- **A/B infra** (RevenueCat Experiments) — prérequis pour mesurer tout le reste.
- **Cancel/win-back** downsell. **Attribution serveur** des invites. **Photo Vibe Analyzer** (F3). **Body scan** (P2). **Design system** (primitives Card/RingGauge/CTA).

## 🔴 COMPLIANCE encore ouverte (bloquant soumission)
Suppression de compte réelle (identité RC + objets R2, pas juste AsyncStorage), R2 en signed URLs, validation magic-byte avant l'appel LLM, age gate 17+, subtitle ≤30. (cf review compliance.)
