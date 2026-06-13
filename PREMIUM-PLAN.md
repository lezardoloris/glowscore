# GlowScore — Premium Plan (Détection · UX · Design)

Extension du [[EPIC-PLAN]] (qui couvre EPIC 1-7 : monétisation, élagage, conformité). Ce document = **EPIC 8 à 16**, focalisés sur ce qui transforme l'app en produit **premium** : la qualité de la **détection**, l'**UX**, le **design**, le **motion**, la **confiance**. Conçu pour être exécuté story par story avec Fable.

Légende: taille **S/M/L/XL** · priorité **P0/P1/P2** · tag **[CODE]** (dev RN/Worker) / **[DESIGN]** (specs UI/motion) / **[ASSET]** (génération images/sons) / **[ROADMAP]**.
Décisions verrouillées (rappel): hard paywall sans trial, femme clinique-luxe, anti-dysmorphie Apple-safe, suite d'outils figée, la boucle scan→score→plan→re-scan = le moat.

---

## 0. TRAVAIL NON FINI À INSÉRER (état réel au 2026-06-11)

Déjà fait et commité (GitHub `lezardoloris/glowscore`): EPIC 1-3, 4.1/4.4, 5.2, 6.1, 7.1 (galerie), 7.2, makeup réel (endpoint+écran), blueprint 12 sem., age gate 17+, skin tracker, caméra live (guardée), web-landing scaffold, UGC playbook, moteur Gemini Nano Banana pour glow_max.

**Restes à finir (repris ci-dessous dans les epics premium):**
- Makeup: l'écran appelle l'endpoint mais à valider sur device + ajouter undo/compare. → EPIC 11.4
- Blueprint 12 sem.: la rotation de focus existe, manque le contenu prescriptif par semaine (vraies routines) + le delta par composant. → EPIC 13.2
- Caméra on-device: écran posé mais frame-processor de validation de visage + mesh non câblés (dev build requis). → EPIC 8.1/8.4
- Skin tracker: delta peau affiché, manque la vraie courbe + sous-scores peau dédiés. → EPIC 8.6
- Galerie d'options: branchée, manque l'état "see your version" (projeter sur SA photo). → EPIC 9.6
- Notifications: rescan J+6 existe, manque streak-at-risk + plan check-in. → EPIC 13.4
- Logo dans les en-têtes (3.3), splash final. → EPIC 10.5
- Percentile: server-side OK, à calibrer sur vraie distribution à 10k users. → EPIC 8.5

---

## EPIC 8 — Moteur de détection & précision du scan (P0) [le cœur produit]
**Goal:** que le score soit perçu comme une vraie mesure clinique, pas un gadget. La crédibilité de la détection = la crédibilité de toute l'app.

- **8.1 Validation de visage avant l'appel payant** [CODE][P0][M] — *En tant qu'utilisatrice, si je n'ai pas de visage net face caméra, on me le dit AVANT de consommer un scan.* AC: frame-processor `react-native-vision-camera-face-detector` (déjà installé) sur `camera-scan.tsx` détecte 1 visage, frontal, yeux ouverts, taille suffisante; sinon overlay "Centre ton visage / plus de lumière". Côté upload photo: pré-check via détection avant POST. *Files:* camera-scan.tsx, scan-result.tsx, Worker magic-byte (fait).
- **8.2 Guidage de capture "studio"** [DESIGN+CODE][P0][M] — *Je suis guidée pour la meilleure photo (angle, lumière, neutralité).* AC: cadre ovale animé, jauge de qualité live (lumière/centrage/netteté), compte à rebours 3s, capture auto quand "vert". Inspiration: apps dermato pro. *Files:* camera-scan.tsx.
- **8.3 Mesh facial 478 points (overlay premium)** [CODE][P1][L] — *Je vois des points/vecteurs se poser sur mon visage pendant l'analyse = preuve de sérieux.* AC: MediaPipe FaceMesh ou landmarks vision-camera → overlay Skia (lignes roses + nœuds) animé 5-8s. Le "Marquardt mask" du proto Gemini. *Files:* camera-scan.tsx, nouveau `FaceMeshOverlay`. Dev build requis.
- **8.4 Scoring géométrique server-side (dé-halluciner)** [CODE][P0][L] — *Les sous-scores (symétrie, ratios) reposent sur de vraies mesures, le LLM ne fait que le narratif.* AC: porter les ratios golden-ratio/symétrie (réf GoldenFace) dans le Worker à partir des landmarks; symmetry/nose/jawline/lips calculés, pas devinés; le LLM écrit description+tips+treatments. *Files:* Worker, faceScan.
- **8.5 Percentile calibré** [CODE][P1][S] — percentile server-side (fait) à recalibrer sur la vraie distribution une fois 1-10k scans collectés (table de quantiles). *Files:* Worker.
- **8.6 Sous-scores peau dédiés (Skin Engine)** [CODE][P1][M] — *Mon score peau se décompose (acné, pores, texture, hydratation, éclat) et se suit dans le temps.* AC: rubrique LLM peau dédiée → 5 sous-scores persistés en ScanRecord; courbe par sous-score dans Progress. Base du futur affilié skincare. *Files:* Worker, history.ts, history.tsx.
- **8.7 Cohérence du score (anti-jitter)** [CODE][P1][S] — *Deux scans de la même photo donnent le même score.* AC: temperature 0 (fait) + cache par hash d'image (même image → même résultat 24h). *Files:* Worker.
- **8.8 Détection multi-angle (profil)** [ROADMAP][P2][L] — capture face + 3/4 pour un vrai score de profil/nez. *Files:* camera-scan, Worker.

## EPIC 9 — Le Reveal comme moment premium (P0) [l'écran signature]
**Goal:** le reveal doit donner envie de payer ET de partager. C'est 80% de la conversion.

- **9.1 Animation de scan cinématique** [DESIGN+CODE][P0][L] — *Une séquence 7-10s: vecteurs qui se posent, jauge à 99%, puis coupure nette sur le paywall.* AC: timeline Reanimated/Skia, halo qui pulse, son subtil (cf 9.5). Reprend le proto Gemini. *Files:* scan-result loading, nouveau composant.
- **9.2 Reveal séquencé** [DESIGN+CODE][P0][M] — *Le score apparaît par étapes (avatar → ring sweep → count-up → barres en stagger → carte potentiel).* AC: ring (fait) + count-up (fait) + barres animées 0→valeur avec délai 80ms, carte Maxed-Out en dernier. *Files:* scan-result.
- **9.3 Haptique chorégraphiée** [CODE][P1][S] — *Je sens le score "monter".* AC: tick haptique pendant le count-up, impact à la fin, success sur le potentiel. *Files:* scan-result, haptics.
- **9.4 Carte de partage 9:16 brandée** [CODE][P1][M] — *Je partage mon reveal en story.* AC: Skia compose ring+score+composants+logo en 1080x1920, export via view-shot, bouton Share visible. Répare le natif. *Files:* shareGenerator, ShareCard.
- **9.5 Sound design** [ASSET+CODE][P2][S] — 3 sons (scan loop, reveal ding, unlock). *Files:* assets/sounds, expo-av.
- **9.6 "Voir TA version" par composant** [CODE][P1][M] — *Dans la galerie d'options, je vois la projection sur MA photo, pas un modèle.* AC: tap composant → glow ciblé sur la selfie (Gemini, prompt par zone) → before/after. *Files:* component-detail, Worker.

## EPIC 10 — Design system premium (P0) [la cohérence visuelle]
**Goal:** que chaque pixel respire le luxe clinique. Un design system unifié = vitesse + cohérence + A/B faciles.

- **10.1 Tokens & primitives** [CODE][P0][M] — *Un seul système.* AC: étendre `theme.ts` (espacements, radius, ombres, échelle typo, durées motion); primitives `<Screen>`, `<Card>`, `<PrimaryCTA>`, `<RingGauge>`, `<MetricBar>`, `<Chip>` réutilisées partout. *Files:* src/components/ui/*.
- **10.2 Échelle typographique** [DESIGN+CODE][P0][S] — *Hiérarchie claire et chic.* AC: police premium (Fraunces/Playfair pour les titres, Inter pour le corps), 6 niveaux, line-heights définis. *Files:* theme, expo-font.
- **10.3 Langage de motion** [DESIGN][P0][S] — courbes d'easing, durées, patterns (fade-up, stagger, sweep) documentés et appliqués. *Files:* PREMIUM doc + reanimated presets.
- **10.4 Iconographie & illustration unifiées** [ASSET+CODE][P1][M] — remplacer tous les emojis restants par Ionicons/illustrations roses cohérentes; jeu d'icônes custom pour les 6 composants. *Files:* partout.
- **10.5 Branding: logo en en-têtes + splash** [CODE][P1][S] — mark dans les headers, splash animé. (reste de 3.3) *Files:* _layout, screens, app.json.
- **10.6 Profondeur & matière** [DESIGN+CODE][P2][M] — verre dépoli (expo-blur), dégradés subtils rose-gold, ombres douces pour le "luxe". *Files:* cards, paywall, reveal.

## EPIC 11 — UX flows & micro-interactions (P1)
- **11.1 États vides premium** [DESIGN+CODE][P1][S] — chaque écran sans data a une illustration + 1 CTA (Progress, plan, galerie). *Files:* history, glow-plan.
- **11.2 États de chargement & squelettes** [CODE][P1][S] — skeletons roses au lieu de spinners. *Files:* tous les écrans réseau.
- **11.3 Gestion d'erreur humaine** [CODE][P1][S] — messages clairs + retry, jamais d'erreur technique brute. *Files:* scan-result, processing, outils.
- **11.4 Outils: compare/undo/save** [CODE][P1][M] — chaque outil (makeup, hair, relight...) a un avant/après slider + Save propre. (finit makeup) *Files:* result, virtual-makeup.
- **11.5 Transitions d'écran cohérentes** [CODE][P2][S] — shared element sur la photo selfie entre home→scan→reveal. *Files:* _layout, screens.
- **11.6 Pull-to-rescan & gestes** [CODE][P2][S] — gestes naturels (swipe entre composants, pull pour re-scan). *Files:* scan-result, home.

## EPIC 12 — Onboarding & quiz (pré-suasion) (P1)
- **12.1 Quiz long pré-suasif (15-20 steps)** [DESIGN+CODE][P1][L] — *Plus j'investis, plus je convertis.* AC: étendre le quiz (insécurités, objectifs, déclencheurs émotionnels, sélfie habits, "pour qui") avec barres de progression et copy persona. *Files:* onboarding.
- **12.2 Persona branching visuel** [CODE][P1][M] — la copie du reveal + paywall s'adapte au persona (déjà: focus→scan). Ajouter la copie. *Files:* scan-result, pricing.
- **12.3 Social proof & "10k members"** [DESIGN][P1][S] — avis/chiffres crédibles (pas faux), badges. *Files:* onboarding, paywall.
- **12.4 Preview du résultat dans le quiz** [CODE][P2][M] — un mini-aperçu animé qui teasing le score à venir. *Files:* onboarding.

## EPIC 13 — Rétention & gamification (P1)
- **13.1 Streaks & milestones** [CODE][P1][M] — streaks (fait) + badges (#3/#7/#30 scans, semaines complètes). *Files:* glowPlan, Progress, nouveau badges.
- **13.2 Blueprint 12 sem. prescriptif** [CODE][P1][L] — *contenu réel par semaine* (routines skincare/makeup/gua-sha datées) + delta par composant au re-scan ("Skin +6 cette semaine"). (finit 5.1) *Files:* glowPlan, glow-plan, Worker.
- **13.3 Challenges hebdo** [CODE][P2][M] — défi de la semaine lié au composant le plus bas. *Files:* glow-plan.
- **13.4 Notifications intelligentes** [CODE][P1][S] — rescan J+6 (fait), streak-at-risk, plan check-in matin/soir, "ton glow a progressé". *Files:* notifications.
- **13.5 AI Coach chat** [ROADMAP][P2][L] — chat glow-up (moat Overglow), répond avec le contexte du scan. *Files:* nouveau, Worker LLM.

## EPIC 14 — Confiance, crédibilité & sécurité psy (P0/P1)
- **14.1 Langage clinique positif** [DESIGN][P0][S] — audit de toute la copy: "opportunité d'optimisation", jamais "défaut/laid". *Files:* tous.
- **14.2 Garde-fous BDD renforcés** [CODE][P1][S] — plancher score (fait), lien NEDA (fait), rate-limit re-scan (>5/24h pause douce), pas de leaderboard. *Files:* scan-result, Worker.
- **14.3 Preuve before/after honnête** [DESIGN][P1][S] — disclaimers "visualisation artistique", cadrage cosmétique non-médical partout. *Files:* result, reveal.
- **14.4 Confidentialité visible** [DESIGN+CODE][P1][S] — "photo non stockée", consentement (fait), suppression compte (fait) mis en avant = trust. *Files:* onboarding, settings.

## EPIC 15 — Accessibilité & responsive (P1)
- **15.1 Dynamic Type & contrastes** [CODE][P1][M] — tailles texte respectées, contrastes AA, labels a11y. *Files:* primitives.
- **15.2 Responsive 360→Pro Max + tablette** [CODE][P1][S] — vérifié 360/390/430 (fait), ajouter iPad/grands écrans. *Files:* _layout (cadre), screens.
- **15.3 Dark mode designé** [DESIGN+CODE][P2][M] — variante sombre intentionnelle (pas l'ancien noir), dérivée des tokens. *Files:* theme.
- **15.4 Localisation FR/ES** [ROADMAP][P2][M] — i18n pour ouvrir EU/LatAm. *Files:* i18n.

## EPIC 16 — Détection: produits physiques & extensions (P2) [croissance détection]
**Goal:** capitaliser sur la détection pour des revenus physiques (cf discussion affilié/private-label).
- **16.1 Affiliation skincare branchée sur le score peau** [CODE][P2][M] — le plan/skin-engine recommande des produits nommés → liens affiliés US (Amazon/DTC), redirect Safari (Apple-safe, biens physiques). *Files:* glow-plan, nouveau produits.
- **16.2 Private-label "GlowScore Routine"** [ROADMAP][P2][L] — 3-4 produits marque propre (marge 4-8x) une fois l'affilié validé. *Files:* boutique.
- **16.3 Glow-Up Portrait imprimé (POD)** [ROADMAP][P2][M] — la selfie maxée → art encadré, cadré "cadeau/self-love" (anti-BDD). POD Shopify. *Files:* boutique.

---

## Ordre conseillé pour Fable
**Phase Premium 1 (le moment qui convertit):** EPIC 9 (reveal cinématique + séquencé + share) + EPIC 10.1/10.2 (design system + typo) + EPIC 8.4 (scoring géométrique). → l'app PARAÎT premium et crédible.
**Phase Premium 2 (la détection qui impressionne):** EPIC 8.1/8.2/8.3 (validation + guidage + mesh) en dev build. → la capture devient un "wow".
**Phase Premium 3 (la rétention qui retient):** EPIC 13 (blueprint réel + badges + notifs) + EPIC 8.6 (skin engine). → la boucle tient.
**Phase Premium 4 (polish & a11y):** EPIC 11 + 12 + 14 + 15.
**Phase Croissance:** EPIC 16 (affilié → private-label → POD).

## Comment exécuter avec Fable
## Review 3 agents (2026-06-11) — à traiter
**P0 sécurité/coût (avant tout spend UA):**
- **Hard paywall NON appliqué côté Worker:** `/api/face-scan` et toutes les transfos en quality "standard" ne requièrent pas d'abo (auth seulement pour HD). N'importe qui avec l'URL du Worker a 3 scans/j + transfos standard gratuites. → exiger l'entitlement server-side sur face-scan + transform (sauf le teaser glow_max standard volontaire). `index.ts:1028,747`.
- **validateSubscriber = appUserID en bearer non signé:** un ID d'abonné connu/deviné = premium. → passer à un token signé/JWT. `index.ts:2068`.
- **Rate-limit free par IP = DoS coût** (rotation d'IP → appels payants illimités). → cap global / token par install. `index.ts:386`.
- **R2 public si SIGNING_SECRET absent** (photos de visages énumérables) + HMAC sans expiry. → signer par défaut + TTL. `index.ts:285,2043`.
- **Age gate + consentement local-only** (reset au reinstall, jamais vérifiés server-side) sur du contenu body-image = risque rejet Apple. → persister (age fait) + enforcement.
**Quick-fixes APPLIQUÉS ce jour:** emojis 🔥 → Ionicons flame (history/glow-plan), age gate persisté + requis, panneau reveal en ombre douce (border 3→1), réassurance "Cancel anytime" sur le paywall.
**Quick-fixes restants (codables):** pricing anchoring (lifetime $39.99 < annual $59.99 cannibalise l'ancre; strikethrough annual), teaser Maxed-Out aussi sur l'écran paywall, magic-byte avant le gate de taille + cap base64 vidéo/audio.
**Design premium (roadmap, cf EPIC 9/10):** halo/gradient derrière le ring, vraie hiérarchie typo (un display face + corps léger, pas tout en 800-900), skeletons + animation de scan au lieu du spinner, retirer les hex one-off hors palette dans scan-result.

## Comment exécuter avec Fable
Donner à Fable: ce `PREMIUM-PLAN.md` + `EPIC-PLAN.md` + `GlowScore-Code-Bundle.md` + screenshots. Lui demander d'attaquer une story précise (ex: "EPIC 9.2 reveal séquencé") en sortant: specs design + code RN, critères d'acceptation cochés, tsc clean. Une story = un commit.
