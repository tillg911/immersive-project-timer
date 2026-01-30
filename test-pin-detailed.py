from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

def test_pin_detailed():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to app...")
        page.goto('http://localhost:1420')
        page.wait_for_load_state('networkidle')

        # Expand widget
        print("\n2. Expanding widget by hovering...")
        widget = page.locator('div.relative').first
        widget.hover()
        page.wait_for_timeout(500)

        # Check expanded state
        header = page.locator('text=Project Times')
        print(f"   Expanded panel visible: {header.is_visible()}")
        page.screenshot(path='test-screenshots/pin-detail-01.png')

        # Find and click pin button
        print("\n3. Clicking PIN button...")
        pin_btn = page.locator('button[title="Pin widget open"]')
        if pin_btn.count() > 0:
            pin_btn.click()
            page.wait_for_timeout(300)
            print("   Pin button clicked")
        else:
            print("   ERROR: Pin button not found!")
            return

        # Check if now showing unpin button
        unpin_btn = page.locator('button[title="Unpin widget"]')
        print(f"   Unpin button visible: {unpin_btn.count() > 0}")
        page.screenshot(path='test-screenshots/pin-detail-02.png')

        # Move mouse completely away
        print("\n4. Moving mouse away (to 600, 400)...")
        page.mouse.move(600, 400)
        page.wait_for_timeout(800)

        # Check if widget is still expanded
        header = page.locator('text=Project Times')
        is_visible = header.is_visible()
        print(f"   Widget still expanded: {is_visible}")
        page.screenshot(path='test-screenshots/pin-detail-03.png')

        if not is_visible:
            print("   ERROR: Widget collapsed while pinned!")
        else:
            print("   SUCCESS: Widget stays open when pinned!")

        # Now hover back and try to unpin
        print("\n5. Hovering back to widget...")
        widget.hover()
        page.wait_for_timeout(400)

        # Try clicking unpin
        print("\n6. Clicking UNPIN button...")
        unpin_btn = page.locator('button[title="Unpin widget"]')
        if unpin_btn.count() > 0 and unpin_btn.is_visible():
            unpin_btn.click()
            page.wait_for_timeout(300)
            print("   Unpin button clicked")
        else:
            print(f"   ERROR: Unpin button not found or not visible!")
            print(f"   Count: {unpin_btn.count()}")
            return

        # Check if pin button is back
        pin_btn = page.locator('button[title="Pin widget open"]')
        print(f"   Pin button visible again: {pin_btn.count() > 0}")
        page.screenshot(path='test-screenshots/pin-detail-04.png')

        # Keep mouse on widget - should stay expanded
        print("\n7. Keeping mouse on widget after unpin...")
        page.wait_for_timeout(500)
        header = page.locator('text=Project Times')
        print(f"   Widget still expanded (mouse on it): {header.is_visible()}")

        # Now move mouse away - should collapse
        print("\n8. Moving mouse away after unpin...")
        page.mouse.move(600, 400)
        page.wait_for_timeout(800)

        header = page.locator('text=Project Times')
        collapsed_icon = page.locator('div.w-16.h-16')
        print(f"   Expanded visible: {header.is_visible()}")
        print(f"   Collapsed visible: {collapsed_icon.is_visible()}")
        page.screenshot(path='test-screenshots/pin-detail-05.png')

        print("\n" + "="*50)
        print("PIN DETAILED TEST COMPLETE")
        print("="*50)

        browser.close()

if __name__ == '__main__':
    test_pin_detailed()
