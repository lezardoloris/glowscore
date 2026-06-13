import asyncio
from playwright.async_api import async_playwright
DATA="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
OUT=r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True, channel="chrome")
        pg=await b.new_page(); await pg.set_viewport_size({"width":390,"height":844})
        await pg.goto("http://localhost:8081", wait_until="networkidle")
        await pg.evaluate("localStorage.setItem('hasCompletedOnboarding','true');localStorage.setItem('ai_consent_granted','true');localStorage.setItem('invite_unlocked','true');localStorage.setItem('invite_share_count','3');")
        await pg.goto(f"http://localhost:8081/scan-result?imageUri={DATA}", wait_until="networkidle"); await pg.wait_for_timeout(5000)
        await pg.screenshot(path=OUT+r"\prem_reveal.png")
        await pg.goto("http://localhost:8081/component-detail?key=skin", wait_until="networkidle"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=OUT+r"\prem_gallery.png")
        await pg.goto(f"http://localhost:8081/feature-hub?imageUri={DATA}", wait_until="networkidle"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=OUT+r"\prem_hub.png")
        print("OK"); await b.close()
asyncio.run(main())
