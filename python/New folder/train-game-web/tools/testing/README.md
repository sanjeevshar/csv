Browser & device testing (Playwright)
====================================

Quick start
-----------
Install dev dependencies and Playwright browsers:

```bash
cd train-game-web
npm install
npx playwright install --with-deps
```

Serve the site (example using the included `start` script):

```bash
npm run start
# opens a static server at http://localhost:8080
```

Run tests (cross-browser):

```bash
npx playwright test
```

Run a single browser (headed):

```bash
npx playwright test --project=firefox --headed
```

Troubleshooting
---------------
- If pages fail to load because of CORS or token prompts, set `?token=YOUR_MAPBOX_TOKEN` in the URL used by the test runner or set the `baseURL` in `playwright.config.js` to include the token query.
- For mobile viewport testing, add a Playwright `project` with a mobile user agent and viewport.
