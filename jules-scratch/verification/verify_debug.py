from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the page
        page.goto("http://localhost:5173")

        # Wait for the main container of the designer page to be visible
        designer_page = page.locator('[data-testid="designer-page"]')
        expect(designer_page).to_be_visible(timeout=15000)

        # Take a screenshot to see the initial state
        page.screenshot(path="jules-scratch/verification/initial_state.png")

        # Find the "Load Balancer" component in the palette
        load_balancer = page.get_by_text("Load Balancer")
        expect(load_balancer).to_be_visible()

        # Find the Tldraw canvas container
        tldraw_container = page.locator('.tl-container')
        expect(tldraw_container).to_be_visible()

        # Drag and drop
        load_balancer.drag_to(tldraw_container)

        # Verify that a new shape has been created.
        shape_text = tldraw_container.get_by_text("Load Balancer")
        expect(shape_text).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/drag_drop_verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/drag_drop_error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
