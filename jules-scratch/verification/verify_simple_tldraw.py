from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the page
        page.goto("http://localhost:5173")

        # Wait for the tldraw container to be visible
        tldraw_container = page.locator('.tl-container')
        expect(tldraw_container).to_be_visible(timeout=15000)

        # If the container is visible, the app has loaded without crashing.
        page.screenshot(path="jules-scratch/verification/simple_tldraw_verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/simple_tldraw_error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
