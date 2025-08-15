from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the app's root page
    page.goto("http://localhost:5173/")

    # Wait for the page to be fully loaded
    page.wait_for_load_state("networkidle")

    # Click the library button
    library_button = page.locator('button[aria-label="Library"]')
    library_button.click()

    # Wait for the library sidebar to appear
    page.wait_for_selector('.excalidraw .library-sidebar', timeout=5000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
