# EPIC & Stories - Refonte UX GlowScore (analyse vidéo + concurrents, 2026-06-15)

Basé sur la vidéo walkthrough (8 min, Android), le transcript vocal, et les screenshots concurrents (GlowUp Daily, Mogged, Aura). Statut: ✅ fait / 🟡 partiel / ⬜ à faire. Style: pas de tirets cadratins.

## Constat (ce que la vidéo + le retour montrent)
- **Studio = le coeur de valeur mais c'est le bazar**: 14 tuiles en vrac, granularité incohérente (`Round Face Makeup` au même niveau que `Makeup` et `Glow Up Styles`), features qui ne marchent pas (Clear Skin sans before/after), doublons (`Posture Glow` route vers relight).
- **Sur-indexation plus-size**: `Body Glow Care` est la tuile n°1 du Studio + "Glow at any size" domine le Plan. L'app entière lit comme une app pour femmes en surpoids, alors que c'est une VERTICALE, pas le thème par défaut.
- **Navigation cassée**: pas de bouton retour/X cohérent sur les sous-pages (Body, etc.), home qui "ne colle pas" (scroll).
- **Capture pauvre**: Studio demande de PICK une photo (galerie), pas de prise caméra. Une seule photo, pas d'analyse multi-angle. Les concurrents (GlowUp Daily) font un **scan 3D live "tourne la tête à gauche/droite" avec mesh + %**. On a du code capture multi-angle non intégré.
- **Goals pas clairs**: pas d'explication, pas d'icône (i) pour en savoir plus. (Mogged = cartes titre+sous-titre nettes + Continue.)
- **Ce qui MARCHE**: Max Glow-Up before/after (vérifié sur photo réelle), Color Season (local), De-Bloat scan. Donc la techno est là, c'est l'IA-produit et l'IA qui doivent être fiabilisées par feature.

## Tension stratégique à trancher (rappel)
Plus-size femmes = notre DIFFÉRENCIATION (whitespace, TAM). Mais le retour dit "trop centré dessus". Résolution: **persona-driven**. Si l'utilisatrice choisit `body_glow` à l'onboarding, le Body Care remonte; sinon c'est UNE section parmi d'autres, jamais la tuile n°1 ni le thème du home par défaut.

---

## EPIC UX-1 - Navigation & shell (P0, frustration immédiate)
| Story | Description | AC | Fichier | Statut |
|---|---|---|---|---|
| UX-1.1 | **Bouton retour/X sur TOUTES les sous-pages** | header partagé `ScreenHeader` (chevron back + titre) utilisé par body-care, makeup-round-face, color-season, visual-weight, chrono, stress-scan, skin-change-track, etc. AC: depuis chaque écran on revient en 1 tap. | nouveau `src/components/ScreenHeader.tsx` + écrans | ⬜ |
| UX-1.2 | **Fix scroll home** ("ne colle pas") | home en `ScrollView` avec `contentContainerStyle` flexGrow, safe-area top, pas de contenu coupé/collé sous la status bar. | app/(tabs)/index.tsx | ⬜ |
| UX-1.3 | **Cohérence 5 onglets** | vérifier Home/Progress/Plan/Studio/Me: noms clairs, icône active, pas de "flash" vers home depuis Studio. | app/(tabs)/_layout.tsx | ⬜ |
| UX-1.4 | **Safe-area + status bar** | padding top correct sur web mobile (la barre Chrome mange l'espace). | tous écrans | 🟡 |

## EPIC UX-2 - Studio overhaul (P0, LE focus) ⭐
Le Studio est là où on doit gagner. Le rendre clair, fiable, hiérarchisé.
| Story | Description | AC | Fichier | Statut |
|---|---|---|---|---|
| UX-2.1 | **Tri + réordonnancement des features** | Curare à ~8 tuiles utiles, ordre par valeur/usage. Voir "Triage" plus bas. Glow Up Styles en 1er. | feature-hub.tsx | ⬜ |
| UX-2.2 | **Granularité cohérente** | Plier `Round Face Makeup` DANS `Makeup` (option/onglet), pas une tuile top-level. Idem visual-weight/chrono = sous "Plus" ou retirés. | feature-hub.tsx, virtual-makeup.tsx | ⬜ |
| UX-2.3 | **Body Care hors du Studio par défaut** | Le retirer de la grille Studio générale; accessible depuis le Plan/section Body si persona body_glow. | feature-hub.tsx | ⬜ |
| UX-2.4 | **Capture caméra** | Sur le photo-bar: choix "Prendre une photo" (caméra) OU "Galerie". `launchCameraAsync` + `launchImageLibraryAsync`. | feature-hub.tsx | ⬜ |
| UX-2.5 | **Fix Clear Skin before/after** | Diagnostiquer pourquoi Clear Skin ne montre pas de before/after (preset/endpoint Gemini). AC: avant≠après comme Max Glow-Up. | styles.tsx/processing.tsx, Worker | ⬜ |
| UX-2.6 | **Partage social 1-clic** | Sur le résultat: bouton Partager (OS share sheet IG/TikTok/Snap, déjà ok natif) + carte brandée pré-composée + Save pellicule. Vérifier le web. | result.tsx + ShareCard | 🟡 |
| UX-2.7 | **États "ça marche/ça marche pas"** | chaque tuile soit livre un vrai résultat, soit est cachée. Pas de feature morte visible (cf. cleanup). | feature-hub.tsx | ⬜ |

### Triage features Studio (KEEP / FIX / CUT)
- **Tier 1 (hero, marchent, large public):** Glow Up Styles (méta: Clear Skin, Model look...), Maxed-Out Self (Max Glow-Up), De-Bloat Scan, Color Season.
- **Tier 2 (secondaires, marchent):** Makeup (avec round-face en option dedans), Hair Makeover, Relight, AI Headshot.
- **CUT / plus tard (cachés du grid):** Visual Weight, Chrono-Skincare, Round Face Makeup (plié dans Makeup), Posture Glow (doublon relight), Age Rewind (optionnel), Body Care (déplacé hors Studio).

## EPIC UX-3 - Scan visage: qualité & multi-angle (P0/P1)
| Story | Description | AC | Fichier | Statut |
|---|---|---|---|---|
| UX-3.1 | **Capture multi-angle guidée** (comme GlowUp Daily) | scan live caméra: face + "tourne la tête à gauche/droite", mesh overlay, barre de progression %. Intégrer le code capture déjà écrit. | camera-scan.tsx + face-scan | ⬜ |
| UX-3.2 | **Analyse multi-photos** | envoyer 2-3 angles au scoring pour une analyse plus fiable (face, 3/4 G, 3/4 D). | Worker /api/face-scan, scan flow | ⬜ |
| UX-3.3 | **Qualité photo** | guidage cadrage/lumière avant capture (front-lit, neutre), rejet photo floue/sombre. | camera-scan.tsx | 🟡 |

## EPIC UX-4 - Goals clairs (P1)
| Story | Description | AC | Fichier | Statut |
|---|---|---|---|---|
| UX-4.1 | **Cartes goals épurées** (style Mogged) | titre + sous-titre clair, 1 ligne, tap = sélection. | onboarding.tsx | 🟡 |
| UX-4.2 | **Icône (i) -> info** | chaque goal/score a un (i) qui ouvre un petit modal explicatif ("c'est quoi, pourquoi ça compte, comment on l'améliore"). | nouveau `InfoSheet` + onboarding/scan-result | ⬜ |
| UX-4.3 | **Score component infos** | sur le reveal, chaque composant (skin, eyes, nez/symétrie) cliquable -> explication. Re-prioriser: mettre en avant skin/eyes (marchent), nez/symétrie après. | scan-result.tsx, component-detail.tsx | 🟡 |

## EPIC UX-5 - De-indexer le plus-size (P1, cohérence marque)
| Story | Description | AC | Fichier | Statut |
|---|---|---|---|---|
| UX-5.1 | **Home neutre par défaut** | hero générique glow-up (pas "Glow at any size" sauf persona body_glow). | index.tsx | ⬜ |
| UX-5.2 | **Plan: body care = 1 section** | déjà réservé 2 slots si body_glow; pour les autres personas, body care n'apparaît pas en tête. | glowPlan.ts (✅ logique) + glow-plan.tsx UI | 🟡 |
| UX-5.3 | **Body Care = entrée dédiée** | accessible via Plan/section, pas tuile Studio n°1. | feature-hub.tsx, glow-plan.tsx | ⬜ |

## EPIC UX-6 - Polish (P2)
| Story | Description | AC | Statut |
|---|---|---|---|
| UX-6.1 | Cohérence couleur (beige des résultats -> aligner sur le rose clinical-luxe ou assumer un neutre) | theme | ⬜ |
| UX-6.2 | Cohérence "genre" | l'app est 100% femme; garder un parcours cohérent (le test homme révèle juste l'incohérence de granularité, pas un besoin homme). | global | ✅ (décision) |
| UX-6.3 | Valider les features retenues vs KB marketing (Skool/YouTube/LinkedIn) | docs | ⬜ |

---

## Ordre d'exécution
1. **UX-2 (Studio triage + caméra)** + **UX-1.1 (back partout)**: impact immédiat, c'est le focus.
2. **UX-2.5 (fix Clear Skin)** + **UX-2.6 (share)**.
3. **UX-3 (multi-angle scan)**: gros différenciateur vs concurrents.
4. **UX-4 (goals + info)** + **UX-5 (de-index plus-size)**.
5. **UX-6 polish**.

## Definition of Done
tsc clean + `expo export -p web` OK + check-banned-terms OK + chaque tuile Studio livre un résultat ou est cachée + retour 1-tap partout.
