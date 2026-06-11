import asyncio
from playwright.async_api import async_playwright

DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
OUT = r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, channel="chrome")
        pg = await b.new_page(viewport={"width": 390, "height": 844})
        await pg.goto("http://localhost:8081", wait_until="networkidle")
        # force unlocked + consent so the pink ring + count-up render
        await pg.evaluate("localStorage.setItem('ai_consent_granted','true'); localStorage.setItem('invite_unlocked','true'); localStorage.setItem('invite_share_count','3'); localStorage.setItem('hasCompletedOnboarding','true');")
        await pg.goto(f"http://localhost:8081/scan-result?imageUri={DATA_URI}", wait_until="networkidle")
        await pg.wait_for_timeout(5000)  # let scan mock + ring sweep + count-up finish
        await pg.screenshot(path=OUT + r"\check_ring_unlocked.png")
        print("OK")
        await b.close()

asyncio.run(main())
