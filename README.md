# Pouchless

Pouchless is a mobile-first, local-first Progressive Web App for quitting nicotine pouches. It helps users track use, delay cravings, log triggers, review patterns, and treat slips as information instead of failure.

## Stack

- React, Vite, TypeScript
- Tailwind CSS v4 through `@tailwindcss/vite`
- React Router
- Zustand
- Dexie / IndexedDB
- `vite-plugin-pwa`
- Vitest and Testing Library

## Scripts

```bash
npm run dev
npm run build
npm run build:pages
npm run preview
npm run preview:pages
npm run test
npm run lint
```

For local smoke testing of the craving timer, you can start Vite with:

```powershell
$env:VITE_CRAVING_DELAY_SECONDS="1"
npm run dev
```

The default craving delay is 300 seconds.

## GitHub Pages

This repo is configured for a GitHub Pages project site at:

```text
https://scottrobertson97.github.io/quit-zyn/
```

Routes use hash URLs, such as:

```text
https://scottrobertson97.github.io/quit-zyn/#/today
```

To enable deployment:

1. Push the repo to `main`.
2. Open the GitHub repository settings.
3. Go to **Pages**.
4. Set **Build and deployment** > **Source** to **GitHub Actions**.
5. The workflow in `.github/workflows/pages.yml` will build and deploy `dist`.

To test the Pages build locally:

```bash
npm run build:pages
npm run preview:pages
```

Then open:

```text
http://127.0.0.1:4173/quit-zyn/
```
