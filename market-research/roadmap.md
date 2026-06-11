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
