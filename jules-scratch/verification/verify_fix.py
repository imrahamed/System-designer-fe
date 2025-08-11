from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the login page
        page.goto("http://localhost:5173")

        # Fill in the login form
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Sign In").click()

        # Wait for the Excalidraw component to be ready
        canvas = page.locator("canvas")
        expect(canvas.first).to_be_visible(timeout=15000) # Increased timeout

        # Draw something
        # Click the rectangle tool
        page.get_by_role("button", name="Rectangle").click()

        # Click and drag to draw
        page.mouse.move(400, 400)
        page.mouse.down()
        page.mouse.move(600, 500)
        page.mouse.up()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        # print(page.content()) # This is very verbose
        raise

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
