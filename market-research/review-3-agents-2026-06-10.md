# Review finale 3 agents — GlowScore (2026-06-10)

3 agents ont audité l'app entière en parallèle après la passe "6 composants + consentement IA + clone Aura". Scores: **Funnel 6.5/10 · Design 6/10 · Soumission 6/10**. Code app + worker = tsc CLEAN. Réfs: [[build-log-aura-clone.md]], [[diagnostic-composants-visage.md]].

## ✅ Confirmé en place (les améliorations)
- **Reveal locké** curiosity-gap (??/100 + 6 cartes cadenassées + plan locké), paywall APRÈS le reveal, annual ancré "BEST VALUE".
- **Boucle de rétention réellement câblée**: saveScan + savePlanFromTips + rappel re-scan J+6 + delta "+X since last scan" + streak.
- **Consentement IA double-gated** (étape onboarding + garde-fou avant faceScan): la photo ne part jamais sans opt-in. Bien fait.
- **Garde-fous BDD réels**: plancher score 55, potential≥overall+3, framing positif des 6 composants, lien NEDA, disclaimers.
- **Les 6 composants** correctement classés et libellés positivement (Skin Clarity → Lips & Smile).
- **CORRECTION backlog**: `validateSubscriber` est désormais **fail-CLOSED** (index.ts ~1867), la "bombe à coût fail-open" du backlog est déjà réglée.

## 🔴 P0 — avant tout spend UA (consensus)
1. **Maxed-Out Self montré à PERSONNE avant paiement** (scan-result seePotential). Le déclencheur d'achat #1 (F1) n'est pas utilisé. Le reveal vend un chiffre, pas un visage. → le montrer flouté AVANT le paywall (A/B). *Plus gros levier de conversion.*
2. **Invite-unlock bypassable** (inviteUnlock.ts:44-47): sur Android compté "completed" sans rien envoyer; 3 taps = unlock permanent client-side. → attribution réelle / friction / pas de UNLOCK_KEY persistant.
3. **Suppression de compte absente** (settings "Delete All Data" = AsyncStorage local seulement). Bloqueur Apple 5.1.1(v) car photos envoyées au backend. → vraie suppression (identité RC + objets R2).
4. **R2 public** servi sans auth (handleServeImage), clé 16 hex + préfixe Date.now() devinable. → signed URLs / clés opaques longues; ne jamais cacher le selfie brut (OK actuellement, à garder).
5. **Pas de validation magic-byte** avant l'appel LLM/fal.ai payant (handleFaceScan) → drain de coût sur du garbage.
6. **Percentile confabulé** par le LLM (aucune base population), affiché comme fait "top X%" → calculer server-side ou retirer (risque factuel + BDD).
7. **Vérifier** le retry guard de processing.tsx (double appel fal.ai = 2x coût), subtitle ≤30, age gate 17+.

## 🟡 P1 — cohérence & momentum
- **4 écrans encore en thème SOMBRE** (home/index, settings, history, feature-hub) vs funnel rose → l'utilisateur passe rose→rose→rose→NOIR = effet "deux apps". Re-thème avec le token `C` du funnel. **Le home en priorité** (1er écran post-onboarding).
- **Home ne merchandise pas la boucle**: pas de streak/score/re-scan sur l'écran d'accueil → la rétention (le moat) est invisible au retour, seulement un push J+6.
- **History branché sur l'ancien TransformationRecord**, pas sur les ScanRecord → l'historique des scans n'est pas montré.
- **Reveal sans ring radial ni animation séquencée** (barres seules + photo 104px). Le ring = LE screenshot App Store. Ajouter ring sweep + count-up + barres en stagger.
- **feature-hub = 19 features fourre-tout** (Pet Portrait, Caricature, Couple) qui diluent le positionnement clinique femme → élaguer.
- **Share gated derrière le paiement + en lien texte minuscule** → pour un funnel viral, le partage doit être un bouton secondaire visible.
- **Naming drift**: "GlowUp AI"/"transformations" dans settings/history vs "GlowScore/Facial Harmony".

## ✅ Quick-wins déjà appliqués cette passe
- "5 proportions" → "6 components" (pricing + onboarding).
- Sous-titre loading → "Skin · Symmetry · Nose · Eyes · Jawline · Lips".
- Stepper pill scan-result → reflète les 2 pages réelles (était 4 points statiques).

## Verdict
Le funnel lock-and-tease et la plomberie de rétention sont solides; les 3 agents pointent le même trio: (1) vendre le VISAGE maxé avant le paywall, (2) re-thémer/merchandiser le home pour rendre la boucle visible, (3) durcir compliance/sécurité (suppression compte, R2, magic-byte) avant l'UA. Aucun n'est un blocage de code lourd; ce sont les prochaines priorités.
