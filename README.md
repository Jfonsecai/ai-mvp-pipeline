# VetCare - technical foundation

Veterinary services and products marketplace (MVP). This repository currently holds the **technical
foundation** (pipeline phase P06.1) plus the project artifacts. No user story is implemented yet.

Architecture: a client-server **modular monolith** - a React single-page client served as static
files, one Express application under `/api` (one Vercel Function), one PostgreSQL database (Neon).
Authority: `artifacts/05_arquitecture/ARCHITECTURE_V2.md`, `API_SPEC_V1.yaml`, `DATA_MODEL_V1.md`.

## Prerequisites

- Node.js 22 or newer (`.nvmrc`), npm 10+.
- A PostgreSQL database for anything that touches data (Neon branch `dev`, or a local server).

## Setup

```bash
npm install                     # installs the root app and the client workspace
cp .env.example .env            # then edit .env; never commit it
```

`.env` variables (details in `.env.example`):

| Variable | Used by | Notes |
|---|---|---|
| `APP_ORIGIN` | API | **Required.** The browser origin allowed to make state-changing requests (CR-021). Local: `http://localhost:5173`. |
| `DATABASE_URL` | API | Pooled connection string (Neon pooled endpoint). Optional to start; needed for data and `/api/health/db`. |
| `DATABASE_URL_UNPOOLED` | migrations only | Direct connection string. |
| `FEATURES` | API | Enabled ordering slices (ADR-017). Empty by default. |
| `SESSION_IDLE_MINUTES`, `SESSION_ABSOLUTE_HOURS` | API | Defaults 60 and 12 (TD-05). |
| `TEST_DATABASE_URL` | tests | Optional throwaway database for the database tests. |

## Database

```bash
npm run migrate:status          # lists applied / pending migrations (needs DATABASE_URL_UNPOOLED)
npm run migrate                 # applies pending migrations from ./migrations
```

Migrations are plain SQL (`migrations/NNN_name.sql`), applied with the **direct** connection by the
DevOps role, **never during the Vercel build**. An applied file must not be edited; add a new file.
`001_initial_schema.sql` is DATA_MODEL Appendix A verbatim.

## Run locally

Two terminals:

```bash
npm run dev:api                 # Express on http://localhost:3000
npm run dev:client              # Vite on http://localhost:5173, proxies /api to :3000
```

Open `http://localhost:5173/estado-tecnico` (technical status page: API and database checks).

## Verify the foundation

```bash
npm test                        # unit, HTTP and contract-consistency tests (Node test runner)
npm run build                   # builds the client into ./public
curl http://localhost:3000/api/health        # {"status":"ok"}
curl http://localhost:3000/api/health/db     # {"status":"ok","database":"ok"} when the database answers
```

Database tests run only when `TEST_DATABASE_URL` points at a throwaway database; otherwise they are
skipped (reported as skipped, not passed). Each run creates and drops its own schema.

## Layout

```text
src/index.js            Vercel entry: exports the Express app (UNVERIFIED on Vercel until step 0)
src/app.js              builds the app (COMP-003): middleware order, module registration
src/http/               COMP-003 API boundary: origin guard, session context, route guard, errors, health
src/shared/             COMP-010 shared kernel: config, clock/time zone, outcomes, features, logger, transactions
src/db/                 COMP-011 access: pool (database.js) and SQL migration runner (migrator.js)
src/modules/            business modules (see src/modules/README.md); only session resolution exists
migrations/             SQL migrations
scripts/                dev-server.js (local API), migrate.js (CLI)
client/                 COMP-001 React app (Vite) and COMP-002 design tokens (client/src/design-system)
tests/                  node:test suites
artifacts/              pipeline artifacts (P00-P06); prompts/ pipeline prompts
```

## Deployment notes (Vercel Hobby + Neon; ARCHITECTURE 5.5)

`vercel.json` runs `npm run build` and rewrites non-`/api` paths to `/index.html`. Vercel serves
`public/**` from the CDN and runs `src/index.js` as the single function for `/api/*`. Set the
variables of `.env.example` in the Vercel project (Neon's integration injects `DATABASE_URL` and
`DATABASE_URL_UNPOOLED`). **This setup has not been verified on Vercel.** Before building screens,
run the step-0 checks of ARCHITECTURE 15.1 item 3 / validation COND-001:

1. `/api/health` and `/api/health/db` answer on the deployed URL; static files come from `public/`.
2. Reloading a client route (for example `/estado-tecnico`) returns the client; if not, switch
   `BrowserRouter` to `HashRouter` in `client/src/main.jsx` (P05-ASM-012).
3. Argon2id hashing works on the Vercel runtime (library chosen by the sign-up story; fallback bcrypt, ADR-006).
4. Apply the migration with `DATABASE_URL_UNPOOLED`; a transaction runs through `DATABASE_URL`.

Preview deployments have a different URL per deployment, so `APP_ORIGIN` must be set for them too,
otherwise state-changing requests return `FORBIDDEN_ORIGIN` (open item, see IMPLEMENTATION_LOG).

## Rules for contributors

- Implement stories inside the module boundaries (`src/modules/README.md`); API shapes come from
  `API_SPEC_V1.yaml`, the schema from `DATA_MODEL_V1.md`. Change the contract and the code together (CR-026).
- Screens use only the design tokens in `client/src/design-system/tokens.css` and the components of
  UX_SPEC section 5 (CR-012). A missing visual value is added to UX_SPEC first.
- No secrets in the repository (it is public by decision P05-ASM-011). Logs never contain passwords,
  tokens, emails, phones or addresses (CR-020).
