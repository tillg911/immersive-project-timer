from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

def test_unpin():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to app...")
        page.goto('http://localhost:1420')
        page.wait_for_load_state('networkidle')

        # Expand widget
        print("2. Expanding widget...")
        widget = page.locator('div.relative').first
        widget.hover()
        page.wait_for_timeout(400)

        # Pin it
        print("3. Pinning widget...")
        pin_btn = page.locator('button[title="Pin widget open"]')
        print(f"   Pin button count: {pin_btn.count()}")
        pin_btn.click()
        page.wait_for_timeout(300)

        # Check state
        unpin_btn = page.locator('button[title="Unpin widget"]')
        print(f"   Unpin button count after pin: {unpin_btn.count()}")

        # Try to unpin
        print("4. Trying to unpin...")
        if unpin_btn.count() > 0:
            # Check if button is visible and clickable
            print(f"   Unpin button visible: {unpin_btn.is_visible()}")
            print(f"   Unpin button enabled: {unpin_btn.is_enabled()}")

            # Get bounding box
            box = unpin_btn.bounding_box()
            print(f"   Unpin button box: {box}")

            # Try clicking
            try:
                unpin_btn.click(timeout=5000)
                print("   ✓ Click succeeded")
            except Exception as e:
                print(f"   ✗ Click failed: {e}")

            page.wait_for_timeout(300)

            # Check if pin button is back
            pin_btn_after = page.locator('button[title="Pin widget open"]')
            print(f"   Pin button count after unpin attempt: {pin_btn_after.count()}")
        else:
            print("   ✗ Unpin button not found!")
            # Debug: show all buttons
            all_buttons = page.locator('button').all()
            print(f"   Total buttons: {len(all_buttons)}")
            for i, btn in enumerate(all_buttons):
                title = btn.get_attribute('title')
                print(f"   Button {i}: title='{title}'")

        page.screenshot(path='test-screenshots/unpin-debug.png')
        print("\n   Screenshot saved: unpin-debug.png")

        browser.close()

if __name__ == '__main__':
    test_unpin()
