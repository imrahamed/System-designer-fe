from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the page
        page.goto("http://localhost:5173")

        # Find the "EC2 Instance" component in the palette
        ec2_instance = page.get_by_text("EC2 Instance")
        expect(ec2_instance).to_be_visible(timeout=15000)

        # Find the Tldraw canvas container
        tldraw_container = page.locator('.tl-container')
        expect(tldraw_container).to_be_visible()

        # Drag and drop
        ec2_instance.drag_to(tldraw_container, target_position={'x': 400, 'y': 400})

        # Verify that a new shape has been created.
        # The shape's text should be visible inside the tldraw container.
        shape_text = tldraw_container.get_by_text("EC2 Instance")
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
