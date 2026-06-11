import asyncio
from playwright.async_api import async_playwright

DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
OUT = r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, channel="chrome")
        pg = await b.new_page(viewport={"width": 390, "height": 844})
        # mark onboarding + consent done so home dashboard shows
        await pg.goto("http://localhost:8081", wait_until="networkidle")
        await pg.evaluate("localStorage.setItem('hasCompletedOnboarding','true'); localStorage.setItem('ai_consent_granted','true');")
        # Home (first-time hero, no lastScan)
        await pg.goto("http://localhost:8081/", wait_until="networkidle")
        await pg.wait_for_timeout(2000)
        await pg.screenshot(path=OUT + r"\check_home.png")
        # Reveal with component thumbnails (locked)
        await pg.goto(f"http://localhost:8081/scan-result?imageUri={DATA_URI}", wait_until="networkidle")
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path=OUT + r"\check_reveal_thumbs.png")
        print("OK")
        await b.close()

asyncio.run(main())
