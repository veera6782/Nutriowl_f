NutriOwl - Food Scanner screen

Files created under src/ for the Food Scanner screen prototype:

- src/index.js
- src/App.jsx
- src/pages/FoodScanner.jsx
- src/components/CameraPreview.jsx
- src/components/UploadButton.jsx
- src/components/ScanButton.jsx
- src/components/TipsCard.jsx
- src/components/RecentScanCard.jsx
- src/components/OwlAssistant.jsx
- src/components/BottomNavigation.jsx
- src/services/foodService.js
- src/hooks/useCamera.js
- src/styles/tailwind.css

Notes:
- The design elements (colors, spacing, rounded corners) are expressed using Tailwind classes and a few helper CSS variables.
- The Owl images (owl.png, owl-smile.png) and recent scan placeholders (placeholder1.jpg...) are referenced; replace them with assets in public/ or adjust paths.
- analyzeFood in services returns mocked JSON and simulates latency.
- Framer Motion is used for subtle animations and the loading overlay.
- This is a component-level implementation. To run as a full app, ensure React, React Router, Framer Motion, Tailwind and other deps are installed and tailwind is configured in your build pipeline.

## Backend

The Goals API is provided by `server/server.js` and persists user profiles and wellness plans in `data/nutriowl.json`. Start it separately from Vite:

```bash
npm run api
npm run dev
```

The frontend sends the onboarding email as the current-user identifier through `X-User-Email`. The API provides `GET /api/profile`, `GET /api/goals`, `POST /api/profile`, `POST /api/goals/generate`, `PATCH /api/goals/preferences`, and goal progress updates. This project has no authentication provider yet, so the email identifier should be replaced by the project authentication subject when authentication is added.
