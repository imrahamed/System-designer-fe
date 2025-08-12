from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173")

        # Get the initial number of shapes
        initial_shape_count = page.locator('[data-shape-id]').count()

        # Find the debug button and click it
        create_button = page.get_by_test_id("create-shape-button")
        expect(create_button).to_be_visible(timeout=15000)
        create_button.click()

        # Verify that a new shape has been created.
        expect(page.locator('[data-shape-id]')).to_have_count(initial_shape_count + 1)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/button_verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/button_error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
