from playwright.sync_api import sync_playwright
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

def test_widget():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Navigating to http://localhost:1420...")
        page.goto('http://localhost:1420')
        page.wait_for_load_state('networkidle')

        # Take initial screenshot
        page.screenshot(path='test-screenshots/01-initial.png', full_page=True)
        print("   Screenshot saved: 01-initial.png")

        # Check if collapsed widget is visible
        print("\n2. Checking collapsed widget...")
        collapsed = page.locator('div.w-14.h-14')
        if collapsed.count() > 0:
            print("   ✓ Collapsed widget found")
        else:
            print("   ✗ Collapsed widget NOT found")
            # Let's see what's on the page
            content = page.content()
            print(f"   Page content length: {len(content)}")

        # Hover to expand widget
        print("\n3. Hovering to expand widget...")
        widget_container = page.locator('div.relative').first
        widget_container.hover()
        page.wait_for_timeout(500)  # Wait for animation
        page.screenshot(path='test-screenshots/02-expanded.png', full_page=True)
        print("   Screenshot saved: 02-expanded.png")

        # Check for expanded panel
        expanded = page.locator('text=Project Times')
        if expanded.count() > 0:
            print("   ✓ Expanded panel visible with 'Project Times' header")
        else:
            print("   ✗ Expanded panel NOT visible")

        # Check for project buttons
        print("\n4. Checking project buttons...")
        project_buttons = page.locator('button').filter(has_text='Project')
        count = project_buttons.count()
        print(f"   Found {count} project buttons")

        # Click on first project to start timer
        if count > 0:
            print("\n5. Clicking first project to start timer...")
            project_buttons.first.click()
            page.wait_for_timeout(1500)  # Let timer run
            page.screenshot(path='test-screenshots/03-timer-started.png', full_page=True)
            print("   Screenshot saved: 03-timer-started.png")

            # Check if timer indicator appears (green pulse)
            pulse = page.locator('.animate-pulse')
            if pulse.count() > 0:
                print("   ✓ Timer indicator (pulse animation) visible")
            else:
                print("   ✗ Timer indicator NOT visible")

        # Click settings button
        print("\n6. Opening settings modal...")
        # Keep hovering on widget to keep it expanded
        widget_container.hover()
        page.wait_for_timeout(300)

        settings_btn = page.locator('button').filter(has=page.locator('svg.lucide-settings'))
        if settings_btn.count() == 0:
            # Try alternative selector
            settings_btn = page.locator('button:has(svg)').last

        if settings_btn.count() > 0:
            settings_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path='test-screenshots/04-settings-open.png', full_page=True)
            print("   Screenshot saved: 04-settings-open.png")

            # Check if modal is open
            modal = page.locator('text=Settings')
            if modal.count() > 0:
                print("   ✓ Settings modal opened")
            else:
                print("   ✗ Settings modal NOT opened")

            # Check Projects tab
            print("\n7. Checking Projects tab...")
            projects_tab = page.locator('text=Projects')
            if projects_tab.count() > 0:
                print("   ✓ Projects tab visible")
                projects_tab.first.click()
                page.wait_for_timeout(300)

                # Check for Add Project button
                add_btn = page.locator('text=Add Project')
                if add_btn.count() > 0:
                    print("   ✓ Add Project button visible")
                else:
                    print("   ✗ Add Project button NOT visible")

            # Check Time Log tab
            print("\n8. Checking Time Log tab...")
            timelog_tab = page.locator('text=Time Log')
            if timelog_tab.count() > 0:
                print("   ✓ Time Log tab visible")
                timelog_tab.click()
                page.wait_for_timeout(300)
                page.screenshot(path='test-screenshots/05-timelog-tab.png', full_page=True)
                print("   Screenshot saved: 05-timelog-tab.png")

                # Check for date navigation
                today_label = page.locator('text=Today')
                if today_label.count() > 0:
                    print("   ✓ Today label visible in Time Log")
                else:
                    print("   ✗ Today label NOT visible")

            # Close modal
            print("\n9. Closing settings modal...")
            close_btn = page.locator('button:has(svg.lucide-x)')
            if close_btn.count() == 0:
                close_btn = page.locator('button').filter(has=page.locator('svg')).first

            if close_btn.count() > 0:
                close_btn.click()
                page.wait_for_timeout(300)
                page.screenshot(path='test-screenshots/06-modal-closed.png', full_page=True)
                print("   Screenshot saved: 06-modal-closed.png")
        else:
            print("   ✗ Settings button NOT found")

        # Test clicking different project (timer switch)
        print("\n10. Testing timer switch between projects...")
        widget_container.hover()
        page.wait_for_timeout(300)

        project_buttons = page.locator('button').filter(has_text='Project')
        if project_buttons.count() > 1:
            project_buttons.nth(1).click()
            page.wait_for_timeout(500)
            page.screenshot(path='test-screenshots/07-timer-switched.png', full_page=True)
            print("    Screenshot saved: 07-timer-switched.png")
            print("    ✓ Clicked second project - timer should switch")

        print("\n" + "="*50)
        print("TEST COMPLETE")
        print("="*50)
        print("\nScreenshots saved in test-screenshots/ folder")

        browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    test_widget()
