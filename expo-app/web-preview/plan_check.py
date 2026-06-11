import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        page = await browser.new_page(viewport={"width": 820, "height": 1100})
        await page.goto("file:///C:/Users/tirakninepeiijub/Desktop/GlowUp-Plan-Publication-AppStore.html")
        await page.wait_for_timeout(800)
        # check a few boxes to show progress bar working
        boxes = await page.query_selector_all(".item input[type=checkbox]")
        for b in boxes[:5]:
            await b.check()
        await page.wait_for_timeout(400)
        await page.screenshot(path=r"d:\Documents\APP\GlowUpAI\expo-app\web-preview\check_plan.png", full_page=False)
        print("OK")
        await browser.close()

asyncio.run(main())
