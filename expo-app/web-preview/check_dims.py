import asyncio
from playwright.async_api import async_playwright

DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
OUT = r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"

async def shot(ctx, w, h, path, url, wait=2500, unlocked=False):
    pg = await ctx.new_page()
    await pg.set_viewport_size({"width": w, "height": h})
    await pg.goto("http://localhost:8081", wait_until="networkidle")
    js = "localStorage.setItem('hasCompletedOnboarding','true'); localStorage.setItem('ai_consent_granted','true');"
    if unlocked:
        js += "localStorage.setItem('invite_unlocked','true'); localStorage.setItem('invite_share_count','3');"
    await pg.evaluate(js)
    await pg.goto(url, wait_until="networkidle")
    await pg.wait_for_timeout(wait)
    await pg.screenshot(path=path)
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, channel="chrome")
        ctx = await b.new_context()
        sr = f"http://localhost:8081/scan-result?imageUri={DATA_URI}"
        # Desktop view (shows the web phone frame, not stretched)
        await shot(ctx, 1280, 900, OUT + r"\dim_desktop_home.png", "http://localhost:8081/")
        # Small Android 360
        await shot(ctx, 360, 800, OUT + r"\dim_360_reveal.png", sr, wait=4500, unlocked=True)
        await shot(ctx, 360, 800, OUT + r"\dim_360_pricing.png", "http://localhost:8081/pricing")
        # iPhone 390
        await shot(ctx, 390, 844, OUT + r"\dim_390_home.png", "http://localhost:8081/")
        await shot(ctx, 390, 844, OUT + r"\dim_390_settings.png", "http://localhost:8081/(tabs)/settings")
        # Pro Max 430
        await shot(ctx, 430, 932, OUT + r"\dim_430_reveal.png", sr, wait=4500, unlocked=True)
        print("OK")
        await b.close()

asyncio.run(main())
