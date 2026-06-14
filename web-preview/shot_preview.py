import asyncio
from playwright.async_api import async_playwright
OUT=r"d:\Documents\APP\GlowUpAI\web-preview"
FILE="file:///d:/Documents/APP/GlowUpAI/web-preview/index.html"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True, channel="chrome")
        pg=await b.new_page(); await pg.set_viewport_size({"width":400,"height":860})
        await pg.goto(FILE, wait_until="networkidle"); await pg.wait_for_timeout(800)
        for s in ["home","reveal","pricing","hub","plan"]:
            try:
                await pg.evaluate(f"go('{s}')"); await pg.wait_for_timeout(900)
                await pg.screenshot(path=OUT+f"\\pv_{s}.png")
            except Exception as e: print(s,"err",e)
        print("OK"); await b.close()
asyncio.run(main())
