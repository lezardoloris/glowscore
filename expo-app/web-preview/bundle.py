import os, glob

ROOT = r"d:\Documents\APP\GlowUpAI"
OUT = r"C:\Users\tirakninepeiijub\Desktop\GlowScore-Code-Bundle.md"

# Ordered list of globs (relative to ROOT) to include
PATTERNS = [
    "EPIC-PLAN.md",
    "expo-app/package.json",
    "expo-app/app.json",
    "expo-app/app.config.ts",
    "expo-app/src/config/index.ts",
    "expo-app/src/theme.ts",
    "expo-app/app/_layout.tsx",
    "expo-app/app/onboarding.tsx",
    "expo-app/app/(tabs)/index.tsx",
    "expo-app/app/(tabs)/history.tsx",
    "expo-app/app/(tabs)/settings.tsx",
    "expo-app/app/(tabs)/_layout.tsx",
    "expo-app/app/scan-result.tsx",
    "expo-app/app/pricing.tsx",
    "expo-app/app/glow-plan.tsx",
    "expo-app/app/feature-hub.tsx",
    "expo-app/app/processing.tsx",
    "expo-app/app/result.tsx",
    "expo-app/app/styles.tsx",
    "expo-app/app/hair-change.tsx",
    "expo-app/app/relight.tsx",
    "expo-app/app/headshot.tsx",
    "expo-app/app/age-transform.tsx",
    "expo-app/app/fitness-transform.tsx",
    "expo-app/app/virtual-makeup.tsx",
    "expo-app/src/services/*.ts",
    "expo-app/src/components/*.tsx",
    "CloudflareWorker/src/index.ts",
]

def lang_for(path):
    if path.endswith(".ts") or path.endswith(".tsx"): return "tsx"
    if path.endswith(".json"): return "json"
    if path.endswith(".md"): return "md"
    return ""

seen = set()
files = []
for pat in PATTERNS:
    full = os.path.join(ROOT, pat.replace("/", os.sep))
    for f in sorted(glob.glob(full)):
        if "node_modules" in f: continue
        if f in seen: continue
        seen.add(f)
        files.append(f)

parts = ["# GlowScore — Code Bundle (pour Gemini AI Studio)\n",
         "App Expo/React Native + Cloudflare Worker. Fichiers concatenes ci-dessous, chemin en titre.\n",
         f"Total: {len(files)} fichiers.\n\n---\n"]

total_chars = 0
for f in files:
    rel = os.path.relpath(f, ROOT).replace(os.sep, "/")
    try:
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()
    except Exception as e:
        content = f"[could not read: {e}]"
    total_chars += len(content)
    parts.append(f"\n## `{rel}`\n\n```{lang_for(f)}\n{content}\n```\n")

with open(OUT, "w", encoding="utf-8") as out:
    out.write("".join(parts))

print(f"OK -> {OUT}")
print(f"{len(files)} fichiers, ~{total_chars//1000} K caracteres")
