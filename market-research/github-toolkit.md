# GitHub toolkit — repos open-source pour accélérer GlowScore

Recherche 2026-06-10 (2 agents, stars/maintenance/licence vérifiés). Mappé à nos briques. Réfs: [[review-cro-multiagents-2026-06-10.md]], [[diagnostic-composants-visage.md]].

## 🎯 Le reveal (notre écran signature) — drop-in MIT, à faire en premier
- **react-native-circular-progress** (bartgryszko, ~2.2k★, MIT, dep svg qu'on a) → le **ring de score** avec `animate(value, duration)` = le ring sweep. https://github.com/bartgryszko/react-native-circular-progress
- **react-native-animated-numbers** (heyman333, ~470★, MIT) → le **count-up "??/100"** synchronisé sur le ring. https://github.com/heyman333/react-native-animated-numbers
- **react-native-progress** (oblador, ~3.7k★, MIT) → `Circle`+`Bar` = ring + les **6 barres** des composants en stagger, une seule dep. https://github.com/oblador/react-native-progress
- (alt tout-en-un) react-native-circular-progress-indicator (ring+nombre centré, mais reanimated v2/redash → vérifier RA3).

## 🤳 On-device face mesh / validation (le plus gros win technique)
- **react-native-vision-camera-face-detector** (luicfrr, ~318★, MIT, à jour mai 2026) → **valide un visage avant l'appel LLM payant** (stop au cost-leak) + landmarks pour l'overlay "vecteurs". Drop-in si on passe à VisionCamera. https://github.com/luicfrr/react-native-vision-camera-face-detector
- **VisionCameraSkiaDemo** (mrousavy, MIT) → la boucle Skia pour **dessiner les vecteurs/landmarks live** = l'animation "scan + jauge 99%". Reference. https://github.com/mrousavy/VisionCameraSkiaDemo
- **react-native-mediapipe** (cdiddy77, ~76★, MIT) → vrai **FaceMesh 468 points** si on veut le wireframe dense premium. Adapt.

## 🧮 Dé-hallucinerle score (ratios géométriques déterministes)
- **GoldenFace** (Aksoylu, ~39★, MIT, Python) → **golden-ratio + symétrie + métriques nommées** depuis les landmarks. Porter les formules dans le Worker → symétrie/nez/mâchoire/lèvres sur de la vraie géométrie, le LLM n'écrit plus que le narratif. https://github.com/Aksoylu/GoldenFace
- **HuyTu7/face_rating** (~74★, MIT) → benchmark SCUT-FBP pour **calibrer notre distribution de scores/percentile**. Reference.
- pytorch_face_landmark (cunjian, ~919★, MIT) → landmarks server-side si on calcule les ratios côté Worker.

## 🧴 Skin tracker (roadmap peau + affiliation)
- **SkinCheck.AI / Capstone-C23-PR485** (TF/MobileNetV2) → classifiers **acné / rides / sécheresse** + pattern FastAPI = l'archi la plus proche de notre skin-tracker. Adapt (re-train). https://github.com/Capstone-Project-C23-PR485
- **lqrhy3/skin-disease-recognition** (YOLOv7) → **boîtes par imperfection** (compter l'acné dans le temps) = ce qui rend le suivi crédible. Reference.

## ☁️ Durcir le Worker (nos trous: fail-open, R2 public, pas de magic-byte)
- **edgefirst-dev/worker-kv-rate-limit** (~13★, MIT) → **rate-limit KV** drop-in (ou la binding native Cloudflare GA en primaire). https://github.com/edgefirst-dev/worker-kv-rate-limit
- **neverinfamous/R2-Manager-Worker** → helper **URLs R2 signées HMAC** time-limited (fin du R2 world-readable). Reference.
- **sctg-development/ai-proxy-cloudflare** (~21★, AGPL → copier les patterns) → AI Gateway + validation clé KV + CORS + rate-limit DO, calqué sur OpenRouter (notre stack).

## 🖼️ fal.ai / before-after / share
- **expo-image-compare** (mahdidavoodi7, ~17★, MIT, reanimated v3 = notre stack EXACT) → le **slider before/after** "Maxed-Out Self". Petit → vendor-and-own. https://github.com/mahdidavoodi7/expo-image-compare
- **view-shot + react-native-share** (qu'on a déjà) → **share card 9:16** (compose une View off-screen 1080x1920, capture, partage). Ajouter `@shopify/react-native-skia` pour un texte/dégradé net à l'export.
- **vercel-labs/vercel-fal-image-generator** (Next.js + @ai-sdk/fal, MIT) → patterns d'appel fal propres + base d'une **landing web "try your Maxed-Out Self"**. Adapt.
- fal IP-Adapter Face ID + Leffa try-on (endpoints) → meilleure **rétention d'identité** que le face-swap actuel pour le Maxed-Out Self.

## 💳 Paywall / onboarding / web-to-app
- **react-native-purchases-ui** (RevenueCatUI.Paywall, officiel, MIT) → **paywall remote-configurable + A/B sans rebuild** (on a déjà le SDK core). Dev build requis. https://github.com/RevenueCat/react-native-purchases
- **Superwall** (~59★ SDK, MIT) → A/B paywall/onboarding-gate agressif (si l'A/B devient une priorité). Choisir un seul primaire.
- **software-mansion-labs/react-native-onboarding** (~455★, MIT, avril 2026, par les auteurs de Reanimated) → **shell de quiz onboarding animé** premium. Adapt (on pose la logique de branchement persona dessus).
- **RevenueCat-Samples/stripe-no-website-example** (MIT, officiel) → **Stripe Checkout → webhook → RevenueCat** = notre funnel web-to-app (un achat web débloque l'entitlement que le paywall lit). Adapt.
- **nextjs/saas-starter** (~15.9k★, MIT) → scaffolding landing+pricing+Stripe pour le site web-to-app. Adapt.
- **gluestack-ui** (~5.1k★, MIT) → copier des primitives Card/CTA/Sheet pour figer notre design system rose. Adapt.
- **CalYo** (marcoshernanz, Expo+Convex) → seule app type Cal-AI/Umax open-source à étudier (les vraies sont closed). Reference.

## ✅ INSTALLÉ (2026-06-10, npm, aligné Expo 52, tsc clean)
`react-native-circular-progress@^1.4.1` · `react-native-animated-numbers@^0.6.3` · `react-native-progress@^5.0.1` · `expo-image-compare@^1.0.0` · `@shopify/react-native-skia@^1.5.0` · `react-native-purchases-ui@^8.12.0`
- Les 3 premiers + expo-image-compare = JS pur sur svg/reanimated/gesture-handler (déjà là) → utilisables direct, y compris en preview web.
- **skia + purchases-ui = modules natifs** → nécessitent un **dev build EAS** pour tourner sur device (no-op/à éviter sur web). Skia: pas de config plugin requis en 1.5 (autolink). À builder quand on attaque la share card / le paywall UI.
- Note: `npx expo install` échoue dans ce sandbox (API Expo bloquée), installé via `npm install` avec versions pinnées. Refaire un `expo install --check` sur une machine avec réseau Expo avant build.

## ⏳ NON installé (stack caméra native, à ajouter quand on build le scan on-device)
`react-native-vision-camera` + `react-native-vision-camera-face-detector` + (option) `react-native-mediapipe`. Raison: config plugins + dev build + refonte de la capture (on est en expo-image-picker aujourd'hui). Gros chantier dédié = la validation de visage + l'animation mesh. À planifier séparément.

## ⭐ À faire en priorité (consensus des 2 agents)
1. **Le reveal**: ring (circular-progress) + count-up (animated-numbers) + barres (progress) sur une seule timeline Reanimated. 3 libs MIT drop-in = notre écran signature d'un coup.
2. **Stop au cost-leak + animation scan**: vision-camera-face-detector (valide le visage avant l'appel payant) + la boucle Skia de VisionCameraSkiaDemo (les vecteurs).
3. **Dé-halluciner le score**: porter les ratios GoldenFace dans le Worker (symétrie/nez/mâchoire/lèvres déterministes), LLM = narratif only.
4. **Durcir le Worker**: rate-limit KV + URLs R2 signées HMAC + magic-byte, avant tout spend UA.
5. **Paywall**: passer à react-native-purchases-ui (A/B sans rebuild).
