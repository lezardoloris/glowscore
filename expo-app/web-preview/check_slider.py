import asyncio
from playwright.async_api import async_playwright

OUT = r"d:\Documents\APP\GlowUpAI\expo-app\web-preview"
# two DIFFERENT faces so the before/after is visibly different
BEFORE = "https://i.pravatar.cc/512?img=1"
AFTER = "https://i.pravatar.cc/512?img=8"
URL = f"http://localhost:8081/result?imageUri={BEFORE}&resultUri={AFTER}&styleId=clear_skin&isHD=false"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, channel="chrome")
        pg = await b.new_page()
        await pg.set_viewport_size({"width": 390, "height": 844})
        await pg.goto("http://localhost:8081", wait_until="networkidle")
        await pg.evaluate("localStorage.setItem('hasCompletedOnboarding','true'); localStorage.setItem('ai_consent_granted','true');")
        await pg.goto(URL, wait_until="networkidle")
        await pg.wait_for_timeout(2600)  # auto-reveal settles to 0.5
        await pg.screenshot(path=OUT + r"\slider_center.png")
        # Drag the divider to the LEFT (reveals more AFTER)
        await pg.mouse.move(300, 280)
        await pg.mouse.down()
        for x in (260, 200, 120, 80):
            await pg.mouse.move(x, 280)
            await pg.wait_for_timeout(60)
        await pg.mouse.up()
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + r"\slider_left.png")
        # Drag to the RIGHT (reveals more BEFORE)
        await pg.mouse.move(120, 280)
        await pg.mouse.down()
        for x in (200, 280, 330):
            await pg.mouse.move(x, 280)
            await pg.wait_for_timeout(60)
        await pg.mouse.up()
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + r"\slider_right.png")
        print("OK")
        await b.close()

asyncio.run(main())
