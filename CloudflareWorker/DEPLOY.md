# Déployer le Worker GlowScore (débloque le before/after réel sur Vercel)

Tant que le Worker n'est pas déployé, l'app web (Vercel) **simule** les transfos → before == after. Une fois déployé + `WORKER_BASE_URL` mis dans Vercel, c'est du vrai Gemini. Ces étapes nécessitent TON compte Cloudflare (login interactif). Style: pas de tirets cadratins.

## 1. Login Cloudflare
```
cd CloudflareWorker
npx wrangler login
```

## 2. Créer KV + R2
```
npx wrangler kv namespace create RATE_LIMIT_KV
# copie l'id retourné dans wrangler.toml (remplace "your-kv-namespace-id")
npx wrangler r2 bucket create glowup-images
```

## 3. Mettre les secrets (un par un, colle la valeur quand demandé)
```
npx wrangler secret put GEMINI_API_KEY      # clé Gemini (text+image). Obligatoire pour le glow-up + color/visual
npx wrangler secret put LLM_API_KEY         # OpenRouter (vision) pour face-scan + color-season + visual-weight
npx wrangler secret put FAL_API_KEY         # fallback fal.ai (optionnel si GEMINI couvre tout)
npx wrangler secret put REVENUECAT_API_KEY  # validation d'abonnement (entitlement serveur en prod)
npx wrangler secret put SIGNING_SECRET      # signe les URLs /images (recommandé)
npx wrangler secret put APP_TOKEN           # anti-abus: doit matcher EXPO_PUBLIC/APP_TOKEN côté app
```
Note: `ENVIRONMENT` reste "production" (wrangler.toml) → l'entitlement serveur s'active (pas de dev-bypass en prod).

## 4. Déployer
```
npx wrangler deploy
```
Note l'URL retournée, ex: `https://glowup-api.<ton-compte>.workers.dev`. Le cron de purge R2 (toutes les 6h) se met en place automatiquement.

## 5. Brancher Vercel sur le Worker
Vercel → projet glowscore → Settings → Environment Variables → ajouter:
```
WORKER_BASE_URL = https://glowup-api.<ton-compte>.workers.dev
APP_TOKEN       = <même valeur qu'au step 3 si tu l'as mis>
```
Puis Deployments → Redeploy. Le before/after, Color Season et Visual Weight deviennent réels sur l'URL publique.

## 6. (optionnel) CORS pour le domaine Vercel
Dans `src/index.ts`, `allowedOrigins` autorise `https://glowupai.app` + localhost. Ajoute ton domaine Vercel (`https://glowscore-nine.vercel.app`) à la liste si tu appelles le Worker depuis le web public.

## Test rapide après déploiement
```
curl https://glowup-api.<ton-compte>.workers.dev/api/health   # doit renvoyer {"status":"ok"}
```
