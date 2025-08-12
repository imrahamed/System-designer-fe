from playwright.sync_api import sync_playwright
import json
import base64
import re

def handle_console_message(msg):
    print(f"Browser console: {msg.type} {msg.text}")

def handle_route(route):
    if re.search(r"/api/designs$", route.request.url):
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": "1", "title": "Design 1", "description": "This is design 1"},
                {"id": "2", "title": "Design 2", "description": "This is design 2"},
            ])
        )
    elif re.search(r"/api/components$", route.request.url):
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": "1", "name": "Component 1"},
                {"id": "2", "name": "Component 2"},
            ])
        )
    else:
        route.continue_()

# Create a dummy JWT token
header = {"alg": "HS256", "typ": "JWT"}
payload = {"sub": "1234567890", "name": "Jules", "iat": 1516239022, "email": "jules@example.com"}
encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=').decode()
encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b'=').decode()
signature = "dummy_signature"
dummy_token = f"{encoded_header}.{encoded_payload}.{signature}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Intercept network requests
    page.route("**/*", handle_route)

    # Set the token in local storage
    page.goto("http://localhost:5173") # Go to the page first to have a context for local storage
    page.evaluate(f"localStorage.setItem('jwt_token', '{dummy_token}')")

    page.on("console", handle_console_message)
    page.goto("http://localhost:5173")
    page.wait_for_selector('[data-testid="designer-page"]')
    page.screenshot(path="jules-scratch/verification/sidebar_verification.png")
    browser.close()
