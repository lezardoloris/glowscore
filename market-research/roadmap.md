# GlowScore / GlowUp AI — Roadmap des features et verticales

Mise à jour 2026-06-10. Les idées validées strategiquement attendent ici leur tour d'exécution. Réfs: [[glowscore-plan-detaille.md]], [[10-agent-review-backlog.md]], [[gemini-deep-research-personas-femmes.md]] (psychologie personas + money map, archivé), analyse screenshots concurrents (Aura, Mogged, GlowUp Daily) du 2026-06-10.

## EN COURS — V1 "copie Aura"
Clone du funnel Aura à 80-90% (quiz long féminin → scan → Facial Harmony ??/100 floutée → hard paywall "Unlock Your Glow Up" + invite 3 friends → plan de treatments locké). Variable changée: boucle fermée scan → plan → re-scan → delta progression. Cible: l'Optimisatrice data-driven 18-28.

## 💎 PRIORITÉ HAUTE (la prochaine "variable" candidate)

### Skin Scanner — note peau + progrès + routine (idée du 2026-06-10)
**Le concept:** photo du visage → l'IA note acné / rides / pores / hydratation (+ texture, rougeurs, éclat) → score peau global + sous-scores → suivi de l'évolution semaine après semaine (courbe de progression) → routine recommandée matin/soir → recommandations produits avec **commission affiliée en bonus** (Amazon/Sephora/iHerb ou marques DTC).

**Pourquoi c'est très fort:**
- **Audience:** les obsédés skincare (Gen Z + femmes), énorme et dépensière. Marché AI dermatologie projeté ~10Md$ d'ici 2036 (réf Gemini Deep Research).
- **Psychologie:** usage QUOTIDIEN + anxiété cutanée = jackpot émotionnel (le persona "Optimisatrice" + "Anxieuse de l'horloge biologique" du Gemini research). La peau change vite (sommeil, cycle, stress) donc le re-scan a une vraie raison d'être quotidien/hebdo, contrairement à la structure osseuse qui ne bouge pas.
- **Synergie parfaite avec notre moat:** c'est LA version la plus crédible de la boucle scan → plan → re-scan → progrès. Le delta peau est RÉEL et visible en 2-4 semaines (vs jawline statique chez les concurrents).
- **Monétisation double:** abonnement (suivi + routine personnalisée) + affiliation produits (revenu par recommandation, zéro coût marginal). Personne dans les screenshots concurrents ne fait l'affiliation.
- **Brand-safe:** "santé de la peau" passe Apple beaucoup plus facilement que "note ton visage". Catégorie Health/Wellness possible.

**Briques déjà en place:** le face-scan note déjà `skin` (0-100); le worker vision LLM peut sortir des sous-scores acné/rides/pores/hydratation en étendant la rubrique (même pattern que l'extension Aura metrics); glowPlan.ts = la routine quotidienne avec streak; history.ts + ScanRecord = la courbe de progression.

**Delta à construire:** rubrique LLM dédiée peau (8-10 dimensions dermato), écran "Skin Report" avec zones du visage, courbe d'évolution multi-scans, moteur de reco produits (table produits par problème + liens affiliés), notifications re-scan hebdo.

**Position roadmap:** v1.1 ou v2, après validation du funnel Aura-clone. Peut devenir LA feature de rétention (le scan facial complet = acquisition/wow, le skin tracking = la raison de rester abonnée).

## P1 — après le funnel V1
- Export vidéo before/after 9:16 (munition ads UGC, Phase 4 du plan détaillé)
- Scan 3D mesh cosmétique au moment du scan (pattern GlowUp Daily, crédibilité) + variante Gemini: animation "vecteurs tracés" 7-10s qui s'interrompt à 99% juste avant le paywall
- A/B test placement Maxed-Out Self: Gemini recommande de MONTRER le visuel maxé AVANT le paywall (le choc visuel = déclencheur d'achat F1 post-rupture), vs notre V1 qui le verrouille derrière. À tester quand le funnel tourne.
- Profondeur du Blueprint: passer de 3 treatments à un protocole 12 semaines granulaire et prescriptif (le risque #1 de remboursement selon Gemini = checklist générique "buvez de l'eau")
- Colorimétrie / Color Season dans la rubrique LLM (viral TikTok féminin, pattern Glam Up)
- Percentile calculé server-side (normalCDF) au lieu du LLM
- Web-to-app funnel (landing + quiz web + Stripe, pattern Cal AI) une fois l'unit economics validée en IAP

## P2 — moat / scaling
- Usine UGC AI (Higgsfield + Claude, playbook Ernesto)
- AI Coach chat (pattern Overglow)
- Challenges hebdo + milestones de scans
- Server-side usage enforcement (usageMeter client-only bypassable)

---

# ROADMAP "MEILLEURE APP POSSIBLE" (consolidée 2026-06-15)

Synthèse priorisée de tout ce qui reste pour une app excellente, ancrée sur: [[gemini-deep-research-rapport-strategique-2026-06]] (personas/WTP), [[etude-differenciation-stress-faciometre-2026-06]] (tendances TikTok + hero), [[review-10-agents-persona-product-plan-2026-06-14]] et [[review-5-agents-execution-2026-06-15]]. EPICs détaillés dans `PERSONA-PRODUCT-PLAN.md`. Déjà LIVE: home premium, glow-plan par persona, Stress-Faciomètre (écran + worker `destress`), vraie transfo Gemini en web local, déploiement Vercel `glowscore-nine.vercel.app`.

## P0 — Fondations (bloquant prod / argent / store)
1. **Entitlement côté serveur** (Worker): `glow_max`/`destress` passent en limite IP standard, paywall client contournable → enforcer l'abonnement RevenueCat dans le Worker (sinon coût Gemini ouvert + paywall percé). Le plus critique.
2. **Conformité Apple finalisée**: garde-fous score (plancher 55 + framing potentiel), retirer "looksmaxxing/mewing/rate" de l'ASO, **firewall claims médicales** (disclaimer "pas un dispositif médical" + wordlist bannie), before/after watermark "AI simulation" + jamais en screenshots store.
3. **Privacy / biométrie**: consentement biométrique explicite (BIPA/GDPR Art.9) avant upload, **auto-delete R2** (TTL 24-72h), endpoint "delete my data"/DSAR, DPA Google+fal, liste sous-traitants.
4. **Unit economics**: fair-use (caps scans/transforms), gross-margin-per-active-user en KPI, lifetime 39,99$ repricé (99-129$) ou hors A/B par défaut, cache de la 1re analyse + appels parallélisés.

## P1 — Rétention & activation (faire revenir)
5. **Pont activation J1-J7** (3 actions → 1er delta visible avant J7) + **matrice de notifications lifecycle** (D1/D3/D7/hebdo/win-back/pré-renouvellement).
6. **Architecture single-capture**: 1 selfie calibré alimente skin + color + maxed-out + destress (moins de friction, moins de COGS).
7. **Stress-Faciomètre profondeur**: log quotidien de l'index + streak + courbe (EPIC 25.6), reco actifs de-puff (25.7); puis AR live massage (vision-camera + FaceMesh) = vrai moat technique (25.4).
8. **Milestones qui débloquent les one-shots** (Maxed-Out, Headshot) au lieu de les donner d'emblée.

## P1 — Acquisition organique & viralité (le moteur de croissance)
9. **Scan "lite" gratuit web** (Color Season ou Stress) sans paywall → carte partageable → **Web-to-App Stripe** (évite 30% Apple). Top of funnel indexable.
10. **Carte image partageable auto sur CHAQUE résultat** (score, palette, before/after) + **drape reveal 3s** comme hook; **parrainage bilatéral** instrumenté (K-factor).
11. **Kit acquisition Cal AI**: comptes pilotes TikTok, 100-150 micro-influenceuses, 3 formats vidéo (explication biologique cortisol / transition 7j / GRWM Corporate), ASO US.

## P1 — Nouvelles features différenciantes (par valeur, étude tendances)
12. **Color Season Studio (EPIC 18)** = #2 valeur + plus gros driver organique (+2200%): calibration lumière, 4 saisons + sous-ton + confiance, palette + shade matcher shoppable, carte "Your Colors". Router P2 (ajouter une question colorimétrie à l'onboarding).
13. **Visual Weight Analyzer** (#visualweight, "Siren Queen / Soft Girl Aura" + filtres maquillage) — viralité 9/10.
14. **Contrast Level Optimizer** (converge avec la colorimétrie) + **Chrono/Circadian Skincare planner** (rétention 9/10, faisabilité élevée).
15. Plus tard: Eyebrow Mapping, Office Siren, Kitchener Essences, Cloud Skin.

## P1 — Profondeur persona (servir P1/P2/P3 à fond)
16. **P1 Glass Skin**: produits/SKU réels (Beauty of Joseon, COSRX, Anua), conflits d'actifs + concentrations, before/after peau lighting-locked, journal de poussées (sommeil/soleil/cycle), crédibilité derma.
17. **P3 Corporate**: bloc plan corporate (déjà ajouté), Headshot pro, coiffures bureau, color→workwear.

## P2 — Polish & différé
- Safe-area insets (paddingTop codés en dur), teaser flouté de projection avant paywall, carte partage streak glow-plan, reminder matin + upsell AR fin de routine.
- Forum communautaire féminin: **CUT v1** (risque UGC Apple/modération/doxxing), éventuel retour texte-only modéré post-PMF.
- Arbitrages: persona lead officiel (Glass Skin #1 vs Optimisatrice), Pro-Aging/Bridal en acquisition secondaire.

## Lancement / infra (manuel)
Déployer le Worker (`wrangler deploy` + secrets FAL/LLM/REVENUECAT/GEMINI/SIGNING/APP_TOKEN) → set `WORKER_BASE_URL` dans Vercel (transfos réelles sur l'URL publique). Compte Apple Dev, RevenueCat sans trial, pages légales, App Store Connect, eas build/submit.
