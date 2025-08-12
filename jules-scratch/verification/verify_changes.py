from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5173/")
        page.wait_for_load_state('networkidle')

        # 1. Verify the left sidebar is gone.
        expect(page.locator('[data-testid="designer-page"]')).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_no_sidebar.png")

        # 2. Add a component.
        page.get_by_role("button", name="Add Component").click()
        page.get_by_role("menuitem", name="AWS Lambda").click()
        expect(page.get_by_text("AWS Lambda")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_component_added.png")

        # 3. Apply a template.
        page.get_by_role("button", name="Templates").click()
        # Click the first template in the dropdown.
        page.get_by_role("menuitem").first.click()
        page.wait_for_timeout(1000) # wait for render
        page.screenshot(path="jules-scratch/verification/03_template_applied.png")

        browser.close()

if __name__ == "__main__":
    run()
