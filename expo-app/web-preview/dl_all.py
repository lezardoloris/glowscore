import json, re, os, urllib.request

SRC = r"C:\Users\tirakninepeiijub\.claude\projects\c--Users-tirakninepeiijub-ECOM\6e5c515d-0b96-4461-abc6-14aa1c87041f\tool-results\mcp-claude_ai_higgsfield-show_generations-1781144379749.txt"
OUT = r"C:\Users\tirakninepeiijub\Desktop\GlowUp-AllImages"
os.makedirs(OUT, exist_ok=True)

with open(SRC, "r", encoding="utf-8") as f:
    data = json.load(f)

items = data.get("items", data if isinstance(data, list) else [])

def slug(prompt):
    p = prompt.lower()
    table = [
        ("app icon", "appicon"),
        ("premium unlock", "paywall_hero"),
        ("facial-analysis interface", "hero_overlay"),
        ("soft-glam makeup", "intent_makeup"),
        ("sculpted balanced features", "intent_surgical"),
        ("clean-girl", "intent_natural"),
        ("photogenic and magnetic", "intent_lifestyle"),
        ("serum drop", "feat_skin"),
        ("glow-up transformation", "feat_glowup"),
        ("makeup brush", "feat_makeup"),
        ("hair styling", "feat_hair"),
        ("studio lighting", "feat_relight"),
        ("nose-shape", "opt_nose"),
        ("nose bridge and profile", "thumb_nose"),
        ("eye-area", "opt_eyes"),
        ("jawline", "jawline"),
        ("lips", "lips"),
        ("facial-harmony", "opt_symmetry"),
        ("symmetry", "symmetry"),
        ("glass-skin", "skin"),
        ("skin", "skin"),
    ]
    for key, name in table:
        if key in p:
            return name
    return "img"

manifest = []
count = 0
seen = {}
for it in items:
    res = it.get("results") or {}
    url = res.get("rawUrl")
    status = it.get("status")
    if not url or status != "completed":
        continue
    prompt = (it.get("params") or {}).get("prompt", "")
    base = slug(prompt)
    seen[base] = seen.get(base, 0) + 1
    name = f"{base}_{seen[base]}.png"
    dest = os.path.join(OUT, name)
    try:
        urllib.request.urlretrieve(url, dest)
        count += 1
        manifest.append(f"{name}\t{url}\t{prompt[:80]}")
    except Exception as e:
        manifest.append(f"FAILED\t{url}\t{e}")

with open(os.path.join(OUT, "_manifest.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(manifest))

print(f"downloaded {count} images to {OUT}")
print(f"total items in list: {len(items)}")
