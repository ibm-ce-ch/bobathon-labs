# GFM Bank Teller Front-End — Starter

A minimal, **runnable** React + IBM Carbon scaffold. The plumbing that's easy to get
wrong is already wired; your job (with Bob) is to build the **pages and components**
from `SPEC.md`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with `teller` / `teller123` (pre-filled).
You'll land on placeholder pages — that's expected.

## What's already wired (don't rebuild these)

| Concern | Where | Why it's provided |
|---|---|---|
| **Backend access / CORS** | `vite.config.js` | Dev proxy `/api/* → backend` (the backend has no CORS headers) |
| **API base URL** | `.env` | `VITE_API_BASE_URL=/api` (same-origin via the proxy) |
| **API client** | `src/services/api.js` | Auth, accounts, transactions, balance inquiry, `/iban-transfer`, status — matches `code/API_REFERENCE.md` |
| **Session** | `src/services/api.js` + `src/auth/` | Token persists in `sessionStorage`; survives refresh and direct URLs |
| **Auth state / guards** | `src/auth/AuthContext.jsx`, `ProtectedRoute.jsx` | `useAuth()` hook; protected routes |
| **Carbon styles + theme** | `src/index.scss` | Single `@use '@carbon/react';` — all components styled |
| **Formatting** | `src/utils/formatters.js` | Currency / date / IBAN helpers |

## What you build (replace these)

- `src/pages/Login.jsx` — working stub → rebuild as a polished Carbon login
- `src/components/Layout.jsx` — **temporary** plain nav → replace with a Carbon **UI Shell** app shell (branding, online/offline status, logout)
- `src/pages/Dashboard.jsx`, `AccountDetails.jsx`, `Transfer.jsx`, `OverdraftRequest.jsx` — placeholders → build per `SPEC.md`

Each file has a `TODO` describing what it should become and which `api.js` function to call.

## Reference

- `../../code/API_REFERENCE.md` — the API contract (endpoints, shapes, auth)
- `../../code/teller_client.py` — the reference teller operations
