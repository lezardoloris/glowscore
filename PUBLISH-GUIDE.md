# GlowScore — Guide de publication (avec URLs)

But: passer du preview Vercel (IA simulée) à une app **publiable avec l'IA réelle**. Style: pas de tirets cadratins.

## Vue d'ensemble (3 niveaux)
1. **Web preview (déjà live)** — `https://glowscore-nine.vercel.app`. UI complète. IA simulée (sauf Color Season qui est déterministe local). Suffit pour montrer le design.
2. **Web avec IA réelle** — déployer le Cloudflare Worker + brancher Vercel dessus. (Étapes A + B + note D.)
3. **App Store (iOS)** — compte Apple + RevenueCat + EAS build/submit. (Étape E.)

---

## A. Déployer le Cloudflare Worker (rend l'IA réelle)

Comptes/clés (ouvre ces URLs, récupère les clés) :
- Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
- Clé Gemini (image + vision) : https://aistudio.google.com/apikey
- OpenRouter (LLM vision, pour face-scan / color-season / visual-weight) : https://openrouter.ai/keys
- fal.ai (fallback image, optionnel si Gemini couvre) : https://fal.ai/dashboard/keys
- RevenueCat (validation abonnement) : https://app.revenuecat.com  → Project Settings → API Keys → la clé **secret v1** (commence par `sk_`)

Commandes (dans `CloudflareWorker/`) :
```bash
cd CloudflareWorker
npx wrangler login                                  # ouvre le navigateur, autorise
npx wrangler kv namespace create RATE_LIMIT_KV      # copie l'id -> wrangler.toml (remplace "your-kv-namespace-id")
npx wrangler r2 bucket create glowup-images         # active R2 si demandé: https://dash.cloudflare.com -> R2
# Secrets (colle la valeur quand demandé) :
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put LLM_API_KEY
npx wrangler secret put FAL_API_KEY                 # optionnel
npx wrangler secret put REVENUECAT_API_KEY
npx wrangler secret put SIGNING_SECRET              # ex: génère avec  openssl rand -hex 32
npx wrangler secret put APP_TOKEN                   # ex: openssl rand -hex 16  (anti-abus)
npx wrangler deploy
```
→ renvoie l'URL, ex `https://glowup-api.TONCOMPTE.workers.dev`.
Test : ouvre `https://glowup-api.TONCOMPTE.workers.dev/api/health` → doit afficher `{"status":"ok"}`.

`ENVIRONMENT` reste `production` (wrangler.toml) → l'entitlement serveur s'active (abonnement requis pour les transfos premium).

## B. Brancher Vercel sur le Worker
1. https://vercel.com/dashboard → projet **glowscore** → **Settings → Environment Variables**
2. Ajoute (Production + Preview) :
   - `WORKER_BASE_URL = https://glowup-api.TONCOMPTE.workers.dev`
   - `APP_TOKEN = <même valeur qu'au step A>`
3. **Deployments → Redeploy** (sans cache).
Doc : https://vercel.com/docs/projects/environment-variables

## ⚠️ Important — IA réelle vs hard paywall sur le web
Après le fix sécurité, le Worker en `production` **exige un abonnement RevenueCat valide** pour les transfos premium (glow_max, destress) et color/visual. Sur le **web public il n'y a pas de RevenueCat** → ces appels renvoient 401 (c'est le comportement voulu en prod : hard paywall).

Donc selon ton objectif :
- **Pour MONTRER l'IA réelle sur le web maintenant (démo/test)** : crée un 2e Worker "staging" et mets son secret `ENVIRONMENT=development` (`npx wrangler secret put ENVIRONMENT` → `development`), pointe un `WORKER_BASE_URL` de preview dessus. L'auth est bypassée → transfos réelles visibles. Ne PAS faire ça sur le Worker de prod (ça ouvrirait l'IA gratuitement).
- **Pour la prod réelle** : l'IA réelle vit dans l'app native (iOS) avec de vrais abonnements RevenueCat. Le web reste une vitrine (IA simulée), ce qui est sain.

---

## C. Amazon Associates (revenus affiliés)
1. Inscription US : https://affiliate-program.amazon.com → récupère ton tag (ex `glowup-20`).
2. Le redirect `glowupai.app/go/:id` (placeholder actuel) doit mapper chaque `product id` vers l'URL Amazon taguée. Le plus simple : une route Worker `/go/:id` (ou une rewrite Vercel) avec une table `id -> ASIN`. Remplis les ASIN par vagues (voir `expo-app/docs/AFFILIATE-ROADMAP.md`).
3. Divulgation obligatoire : ajouter "As an Amazon Associate we earn from qualifying purchases" près des produits.

---

## D. Variable côté build (web ET natif)
`app.config.ts` lit `process.env.WORKER_BASE_URL` au build.
- **Web/Vercel** : via les env vars Vercel (step B) → `expo export` les embarque.
- **Natif/EAS** : ajoute-les dans `eas.json` (env) ou en EAS secret :
  `npx eas secret:create --name WORKER_BASE_URL --value https://glowup-api.TONCOMPTE.workers.dev`

---

## E. App Store iOS (vraie publication)
1. Apple Developer Program (99$/an) : https://developer.apple.com/programs/
2. RevenueCat : https://app.revenuecat.com — crée les produits `glowup_weekly_1299`, `glowup_annual_5999`, `glowup_lifetime_9999`, entitlement `glowup_premium`, et lie l'app App Store.
3. App Store Connect : https://appstoreconnect.apple.com — crée l'app, les IAP, la fiche, les captures. **Ne pas mettre de before/after IA ni de score chiffré dans les captures** (rejet 1.2). Catégorie Health & Fitness ou Lifestyle, classement 17+.
4. Pages légales hébergées : privacy `https://glowupai.app/privacy` (source `legal/privacy-policy.md`), terms `https://glowupai.app/terms`.
5. Build + submit (compte Expo : https://expo.dev) :
```bash
cd expo-app
npx eas login
npx eas build -p ios --profile production
npx eas submit -p ios --latest
```
Doc EAS : https://docs.expo.dev/build/introduction/

---

## Checklist "publiable"
- [ ] Worker déployé + `/api/health` OK
- [ ] Secrets posés (GEMINI, LLM, REVENUECAT, SIGNING, APP_TOKEN)
- [ ] `WORKER_BASE_URL` + `APP_TOKEN` dans Vercel → redeploy
- [ ] (démo web IA réelle) Worker staging avec `ENVIRONMENT=development`
- [ ] Amazon Associates tag + redirect `/go/:id` + ASIN vague 1
- [ ] Apple Dev + RevenueCat produits + App Store Connect + pages légales
- [ ] `eas build` + `eas submit`
