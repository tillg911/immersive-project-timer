from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

def test_pin():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to app...")
        page.goto('http://localhost:1420')
        page.wait_for_load_state('networkidle')

        # Hover to expand
        print("2. Expanding widget...")
        widget = page.locator('div.relative').first
        widget.hover()
        page.wait_for_timeout(500)

        # Check for pin button
        print("3. Looking for pin button...")
        pin_btn = page.locator('button[title="Pin widget open"]')
        if pin_btn.count() > 0:
            print("   ✓ Pin button found")
            page.screenshot(path='test-screenshots/pin-01-before.png')

            # Click pin button
            print("4. Clicking pin button...")
            pin_btn.click()
            page.wait_for_timeout(300)

            # Check if pinned (button should now show unpin)
            unpin_btn = page.locator('button[title="Unpin widget"]')
            if unpin_btn.count() > 0:
                print("   ✓ Widget is now pinned (Unpin button visible)")

            page.screenshot(path='test-screenshots/pin-02-pinned.png')

            # Move mouse away
            print("5. Moving mouse away from widget...")
            page.mouse.move(500, 500)
            page.wait_for_timeout(500)

            # Check if widget is still expanded
            expanded = page.locator('text=Project Times')
            if expanded.is_visible():
                print("   ✓ Widget stays expanded when pinned!")
            else:
                print("   ✗ Widget collapsed despite being pinned")

            page.screenshot(path='test-screenshots/pin-03-still-open.png')

            # Unpin and verify collapse
            print("6. Unpinning widget...")
            widget.hover()
            page.wait_for_timeout(300)
            unpin_btn = page.locator('button[title="Unpin widget"]')
            unpin_btn.click()
            page.wait_for_timeout(300)

            # Move mouse away again
            page.mouse.move(500, 500)
            page.wait_for_timeout(500)

            # Widget should collapse now
            collapsed = page.locator('div.w-14.h-14')
            if collapsed.is_visible():
                print("   ✓ Widget collapses after unpinning")
            else:
                print("   ? Widget state unclear after unpinning")

            page.screenshot(path='test-screenshots/pin-04-unpinned.png')
        else:
            print("   ✗ Pin button NOT found")
            # Debug: list all buttons
            buttons = page.locator('button').all()
            print(f"   Found {len(buttons)} buttons total")

        print("\n" + "="*50)
        print("PIN TEST COMPLETE")
        print("="*50)

        browser.close()

if __name__ == '__main__':
    test_pin()
