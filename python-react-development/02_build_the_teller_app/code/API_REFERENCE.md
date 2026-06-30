# GFM Bank Core Banking API — Teller Reference

This is the contract the Teller Front-End builds against. It documents **only the
endpoints a teller uses**, with real request/response shapes captured from the live
backend. Build the service layer from this document — do not guess endpoint paths,
field names, or auth mechanics.

> Back-office capabilities (customer lookup, overdraft *approval*, manual postings,
> fee reversals) are **out of scope for this lab** — see *Out of Scope* below.

---

## Backend

- **Base URL:** `https://wxo-corebanking-backend.1944johjccn7.eu-de.codeengine.appdomain.cloud`
- **Test IBAN:** `DE89545769475769453536`
- **Teller credentials:** `teller` / `teller123`

> **CORS / dev proxy.** The backend does **not** send `Access-Control-Allow-Origin`
> headers, so a browser cannot call it cross-origin. The app calls a same-origin
> path (e.g. `/api/...`) and a dev proxy forwards to the backend server-side. The
> starter's `vite.config.js` is already set up this way — point the app's base URL
> at `/api`, not at the backend URL directly.

## Authentication

OAuth2 "password" flow. Logging in returns a bearer token sent as
`Authorization: Bearer <token>` on every subsequent request.

> **Note (relevant to Part 3):** in this demo the `access_token` is simply the
> username — there is no signing or expiry. Treat it as an opaque bearer token in
> the front-end; do not rely on decoding it.

---

## Endpoints (teller)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/token` | Log in, get bearer token | none (form body) |
| `GET` | `/accounts` | List accounts (id, IBAN, customer id) | bearer |
| `GET` | `/transactions/{account_id}` | Full transaction ledger for an account | bearer |
| `POST` | `/balance-inquiry` | Computed balance + overdraft + recent tx for an IBAN | bearer |
| `POST` | `/iban-transfer` | Transfer between two IBANs | bearer |

### `POST /token`

Body is **`application/x-www-form-urlencoded`** (not JSON) — this is the most common
mistake. Use `URLSearchParams`, not a JSON body.

```
POST /token
Content-Type: application/x-www-form-urlencoded

username=teller&password=teller123
```
```json
{ "access_token": "teller", "token_type": "bearer" }
```
- `401` on bad credentials.

### `GET /accounts`

```
GET /accounts
Authorization: Bearer teller
```
```json
[
  { "account_id": "1111b474-0fd4-4b31-b2bf-03953c30860d",
    "iban": "DE89850643171390053293",
    "customer_id": "eb0b1407-546c-4ca1-a68d-432a5a8eb754" }
]
```
- Returns ~1000 accounts — filter/paginate client-side.
- A teller sees only `account_id`, `iban`, `customer_id` (no balances on this route).

### `GET /transactions/{account_id}`

```
GET /transactions/1111b474-0fd4-4b31-b2bf-03953c30860d
Authorization: Bearer teller
```
```json
[
  { "tx_id": "a42815e6-ae57-407f-bd4e-ad73a6ed2cf0",
    "account_id": "1111b474-0fd4-4b31-b2bf-03953c30860d",
    "booking_ts": "2025-05-16T18:35:29",
    "amount_eur": 225.63,
    "type": "PAYMENT" }
]
```
- `amount_eur` is signed (credits positive, debits negative).
- `type` ∈ `PAYMENT`, `TRANSFER_IN`, `TRANSFER_OUT`, `FEE_REVERSAL`, `MANUAL_ADJ`.
- **Balance is computed from the ledger**: `sum(amount_eur)`. There is no balance
  column on a transaction. An empty array is a valid (zero-activity) account.

### `POST /balance-inquiry`

The cleanest way to show a balance — the backend computes it for you and returns the
overdraft limit and the most recent transactions in one call.

```
POST /balance-inquiry
Authorization: Bearer teller
Content-Type: application/json

{ "iban": "DE89850643171390053293" }
```
```json
{
  "iban": "DE89850643171390053293",
  "account_id": "1111b474-0fd4-4b31-b2bf-03953c30860d",
  "current_balance_eur": -50530.51,
  "overdraft_limit_eur": 0,
  "available_balance_eur": -50530.51,
  "recent_transactions": [ /* same shape as /transactions */ ]
}
```

### `POST /iban-transfer`  ← use this for transfers

Transfer between two accounts **by IBAN**. This is the working teller transfer route.

```
POST /iban-transfer
Authorization: Bearer teller
Content-Type: application/json

{ "source_iban": "DE89599102290147679764",
  "destination_iban": "DE89851656049451983273",
  "amount_eur": 50 }
```
```json
{
  "status": "POSTED",
  "source_iban": "DE89599102290147679764",
  "destination_iban": "DE89851656049451983273",
  "amount_eur": 50.0,
  "debit_tx": "d233e4e1-c273-44c6-bff1-e40087644c87",
  "credit_tx": "1d68436e-5a41-4085-8725-76602b9ba03a",
  "timestamp": "2026-06-25T11:09:23+00:00",
  "new_balance_eur": 37166.19
}
```
- **Insufficient funds → `403`** with a detail message, e.g.
  `{ "detail": "Insufficient funds. Balance -50530.51, overdraft 0.00" }`.
  The check is `balance - amount < -overdraft_limit`. Surface `detail` to the user.
- Most sample accounts are overdrawn (negative balance), so pick a positive-balance
  source when you want a transfer to succeed.

> ⚠️ **Do not use `POST /transfer`** (the by-`account_id` route). It exists in older
> reference code (`teller_client.py`) but returns **HTTP 500 on the deployed
> backend**. Always transfer via `/iban-transfer`.

---

## Overdraft request (teller)

A teller **cannot grant** an overdraft — changing limits and approvals are
BACKOFFICE-only operations. The teller "overdraft request" is therefore a
**client-side action**: collect the IBAN and requested amount (0–10,000 EUR) and
produce a formatted request message for the back-office team. It is **not** an API
call. (This mirrors `teller_client.py`, which only prints the request.)

---

## Out of scope (BACKOFFICE-only — see Part 4)

These exist on the backend but require the `BACKOFFICE` role; a teller token gets
`403 Forbidden`. Do not build UI for them in this lab:

- `GET /customers` — customer directory
- `PATCH /accounts/{account_id}/overdraft` — set an overdraft limit
- `POST /transactions/{account_id}` — manual posting (`FEE_REVERSAL`, `MANUAL_ADJ`)
- `POST /approve-overdraft`, `POST /fee-reversal`

---

## Data model (for reference)

```
customers (BACKOFFICE only)   accounts                         transactions
  customer_id  ───────────┐     account_id (pk)                  tx_id (pk)
  name                    └───→  customer_id (fk)                 account_id (fk) ──→ accounts
  ...                            iban                             booking_ts (ISO 8601)
                                 overdraft_limit_eur              amount_eur (signed)
                                                                  type
```

- One customer has many accounts; one account has many transactions.
- A teller never sees `customers` or account overdraft limits except via
  `/balance-inquiry`.

---

## Error summary

| Status | Meaning | Front-end handling |
|---|---|---|
| `401` | Bad credentials / missing token | Show login error; on a protected call, log out |
| `403` | Insufficient funds, **or** teller hit a back-office route | Show `detail` message |
| `422` | Validation error (e.g. JSON sent to `/token`) | Fix the request shape |
| `500` | Server error (e.g. the broken `/transfer` route) | Show a graceful failure notice |
