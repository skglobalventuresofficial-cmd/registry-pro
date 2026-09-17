# Registry Pro clean source architecture

The application remains a fast single-page website. `index.html` loads direct source modules only; there are no numbered runtime patch files.

## Core

- `app/core/runtime.js` — shared application runtime and existing common workflow
- `app/core/auth.js` — login, account and role logic
- `app/core/dashboard.js` — dashboard, saved-record search, property and management logic
- `app/core/routing.js` — the only draft router; also owns Open, New Copy and Buyer → Seller entry flows
- `app/core/storage.js` — removes obsolete service-worker caches
- `app/core/common.css` — shared application styling

## Draft modules

Every maintained draft folder contains exactly these five concern files:

- `ui.css`
- `ui.js`
- `calculation.js`
- `pdf.js`
- `draft-actions.js`

Current folders are `agriculture`, `residential-plot`, `residential-building`, `gift`, `agreement`, `commercial-building`, `industrial-building`, `lease`, `sale-after-agreement`, and `more-registry-types`.

## Open from VS Code

Open the `RegistryPro_Compact_Final` folder itself in VS Code and press **F5**. The checked-in `.vscode/launch.json` opens `index.html` in Microsoft Edge using VS Code's built-in JavaScript debugger.

## Circle-rate data

- `data/states/uttarakhand/haridwar/circle-rate.js` — Haridwar district searchable rate/rule data and references
- `data/states/uttarakhand/haridwar/pdfs/` — official bundled PDF books

Future circle-rate jurisdictions should follow `data/states/<state>/<district>/<tehsil>/` without adding code beside `index.html`.
