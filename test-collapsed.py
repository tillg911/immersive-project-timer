from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

def test_collapsed_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to app...")
        page.goto('http://localhost:1420')
        page.wait_for_load_state('networkidle')

        # Take initial screenshot (no timer running)
        print("2. Collapsed state WITHOUT active timer...")
        page.screenshot(path='test-screenshots/collapsed-01-idle.png')
        print("   Screenshot saved: collapsed-01-idle.png")

        # Expand and start a timer
        print("3. Starting timer on Project 1...")
        widget = page.locator('div.relative').first
        widget.hover()
        page.wait_for_timeout(400)

        project_btn = page.locator('button').filter(has_text='Project 1')
        project_btn.click()
        page.wait_for_timeout(300)

        # Move mouse away to collapse
        print("4. Collapsing widget...")
        page.mouse.move(500, 500)
        page.wait_for_timeout(600)

        # Take screenshot of collapsed with active timer
        page.screenshot(path='test-screenshots/collapsed-02-active.png')
        print("   Screenshot saved: collapsed-02-active.png")

        # Check for spinning SVG
        spinner = page.locator('svg.animate-spin')
        if spinner.count() > 0:
            print("   ✓ Spinning indicator visible!")
        else:
            print("   ✗ Spinning indicator NOT found")

        # Start timer on Project 2 (different color)
        print("5. Switching to Project 2...")
        widget.hover()
        page.wait_for_timeout(400)

        project_btn2 = page.locator('button').filter(has_text='Project 2')
        project_btn2.click()
        page.wait_for_timeout(300)

        # Collapse again
        page.mouse.move(500, 500)
        page.wait_for_timeout(600)

        page.screenshot(path='test-screenshots/collapsed-03-project2.png')
        print("   Screenshot saved: collapsed-03-project2.png")

        # Start timer on Project 3
        print("6. Switching to Project 3...")
        widget.hover()
        page.wait_for_timeout(400)

        project_btn3 = page.locator('button').filter(has_text='Project 3')
        project_btn3.click()
        page.wait_for_timeout(300)

        # Collapse again
        page.mouse.move(500, 500)
        page.wait_for_timeout(600)

        page.screenshot(path='test-screenshots/collapsed-04-project3.png')
        print("   Screenshot saved: collapsed-04-project3.png")

        print("\n" + "="*50)
        print("COLLAPSED STATE TEST COMPLETE")
        print("="*50)

        browser.close()

if __name__ == '__main__':
    test_collapsed_state()
