from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    def handle_console(msg):
        print(f"CONSOLE: {msg.text}")
        
    def handle_error(err):
        print(f"ERROR: {err}")
        
    page.on("console", handle_console)
    page.on("pageerror", handle_error)
    
    print("Navigating...")
    page.goto("http://localhost:3000/student/dashboard", wait_until="networkidle")
    
    html = page.content()
    print(f"HTML LENGTH: {len(html)}")
    print(html[:500])
    
    page.screenshot(path="debug_screenshot.png")
    print("Screenshot saved to debug_screenshot.png")
    
    browser.close()
