# Review multi-agents — code mergé 2026-06-15 (5 angles)

Read-only review de tout le code du jour (logique, écrans, Worker, conformité, intégrité data). Owner = qui corrige (Moi = Worker/logique/data ; Cursor = écrans/UI). Style: pas de tirets cadratins.

## 🔴 P0 (à corriger en priorité)

1. **Worker auth bypass** (`index.ts` validateHdAuth/validatePremiumAuth) — `ENVIRONMENT !== "production"` ouvre tout le premium gratuitement. Une var manquante/typo en prod = paywall serveur percé. **Fix: bypass seulement si `ENVIRONMENT === "development"` (default-deny).** → Moi ✅ (corrigé ce tour)
2. **Worker cache hash collision** (`analysisHash`) — hash sur 6000 premiers chars + 12 octets → deux selfies au même header JPEG/EXIF peuvent collisionner → utilisatrice B reçoit le résultat caché de A (fuite + analyse fausse). **Fix: hasher la string complète, garder ≥16 octets.** → Moi ✅ (corrigé ce tour)
3. **Reco: skinType figé à 'tous'** (`recoEngine.contextFromConcerns/contextFromQuiz`) — les règles avec `skin_type` spécifique (grasse/seche/sensible/mixte/mature) ne matchent jamais → **5 des 9 concerns du picker (breakouts, redness, fine_lines, dryness, sagging) renvoient ZÉRO produit.** Le plus gros tueur silencieux du moteur de reco. **Fix: ne pas figer skinType (undefined) OU traiter `'tous'` comme wildcard dans matchesRule.** → Data (à se répartir)
4. **Compliance: Maxed-Out teaser sans label "AI simulated"** (`scan-result.tsx` teaser + CTA glow_max) — tous les autres écrans l'ont, pas le reveal le plus vu. **Blocker Apple.** Fix: ajouter le disclaimer sur la carte teaser + résultat glow_max. → Cursor (écran)
5. **Compliance: onboarding nomme des procédures médicales** (`onboarding.tsx` GLOW_TYPES "Rhinoplasty, facelift / Botox, fillers, lasers") — reco médicale + amplifie 1.2. Fix: reformuler en objectifs non-cliniques (Skincare / Makeup & styling). → Cursor (écran)
6. **stress-scan: état erreur inatteignable** (`stress-scan.tsx` ~166) — `busy || !resultUri` testé avant `err` → spinner infini sur échec. Fix: tester `err` d'abord. → Cursor (écran)

## 🟠 Important
- **Worker transform/makeup sans cache** (cost) — ajouter le même cache `analysisHash` avant `callGeminiGlowup`. → Moi
- **Worker rate-limit TOCTOU** — read-modify-write KV non atomique + rollback écrit une valeur absolue stale (sous/sur-comptage). Vrai fix = Durable Object. → Moi (backlog)
- **colorPalette.ts divide-by-zero** — `generateLipSwatches(base, 1)` → `t = 0/0 = NaN` → `#NaNNaNNaN`. Fix: `count===1 ? 0 : i/(count-1)`. → Cursor (util créé par Cursor)
- **scan-result imageUri non normalisé** — `useLocalSearchParams` peut renvoyer `string[]`; utilisé brut (faceScan, Image). Fix: `Array.isArray(x)?x[0]:x`. → Cursor
- **scan-result blur setInterval sans cleanup** — fuite + setState après unmount. Fix: clearInterval dans le return. → Cursor
- **color-season NaN non gardé** — `result.contrast*10`, `palette.join`, `avoid.length` sans défaut. Fix: `?? 0`/`?? []`. → Cursor
- **glowPlan toggleTaskToday race** — read-modify-write du plan sans lock; 2 taps rapides perdent une complétion. Fix: file de promesses / merge. → Data (à se répartir)
- **dayKey en UTC** (`glowPlan`/`progressAnalytics`) — streak/complétion basculent à minuit UTC, pas local. Fix: clé Y-M-D locale. → Data
- **reco-rules: 8 règles `product_category` non mappable** (blush, bronzer, lipstick, blush_bronzer, scalp_essence, body_oil, routine_template, program) → produit null. Fix: ajouter au categoryMap ou aligner. → Data
- **reco: ~19 concern tags absents de tout produit** → filtrage concern no-op (fallback catégorie). Fix: tagger les produits. → Data
- **Compliance: rétention incohérente** ("48h" vs "not stored afterwards") — aligner sur "within 48 hours" partout. → Cursor
- **Compliance: stress-scan/color-season pickent ImagePicker sans re-check `hasAiConsent`** — ajouter un check consentement avant transform. → Cursor

## 🟡 Nits
CORS échoue en renvoyant glowupai.app au lieu d'omettre l'en-tête; APP_TOKEN dormant si non set; SSRF théorique sur fetch des URLs modèle (allowlist host); reco persona logic muddled (agent 1).

## Bonne nouvelle
0 erreur console sur home/concerns/pricing (rendu sain). Consentement biométrique avant upload présent (scan-result + onboarding). validateSubscriber fail-closed correct. Pas de body-shaming ("flaws") dans la copy. "Glow at any size" = signal positif à garder.

## Répartition suggérée
- **Moi (Worker/logique/data)** : #1 #2 (faits), transform/makeup cache, TOCTOU, + items "Data" (skinType, reco-rules categories, tags, dayKey local, toggle race).
- **Cursor (écrans)** : #4 #5 #6 + colorPalette NaN, imageUri normalize, blur cleanup, color-season guards, rétention copy, consent re-check.
