import asyncio
from playwright.async_api import async_playwright

# 1x1 red pixel PNG as a stand-in selfie
DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
OUT = r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        # AI consent gate (fresh web = no consent stored -> gate shows before scan)
        await page.goto(f"http://localhost:8081/scan-result?imageUri={DATA_URI}", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=OUT + r"\check_consent_gate.png")

        # Grant consent then scan (click "I Agree & Continue")
        try:
            await page.get_by_text("I Agree").first.click()
            await page.wait_for_timeout(4000)
            await page.screenshot(path=OUT + r"\check_scan_locked.png")
        except Exception as e:
            print("consent click skipped:", e)

        # Paywall
        await page.goto("http://localhost:8081/pricing", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=OUT + r"\check_pricing.png")

        # Onboarding quiz (hook)
        await page.evaluate("localStorage.clear()")
        await page.goto("http://localhost:8081/onboarding", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=OUT + r"\check_onboarding.png")

        await browser.close()
        print("OK - 3 screenshots saved")

asyncio.run(main())
