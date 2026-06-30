// GFM Bank Core Banking API client.
//
// This is the service layer the UI builds on. Every endpoint, request shape, and
// response shape here matches code/API_REFERENCE.md (verified against the live
// backend). Build your pages/components to call these functions — you should not
// need to add new endpoints or change the transfer route.
//
// Pre-wired here so you don't have to get the fiddly parts right:
//   - base URL points at the dev proxy (/api), so CORS is a non-issue
//   - login uses the OAuth2 form-encoded /token flow
//   - the bearer token persists in sessionStorage (survives refresh / direct URLs)
//   - transfers use /iban-transfer (the working route; /transfer by account_id 500s)

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({ baseURL: API_BASE_URL });

// --- Token management (persisted so a refresh keeps the teller signed in) ---
const TOKEN_KEY = 'gfm_teller_token';
let authToken = sessionStorage.getItem(TOKEN_KEY) || null;
if (authToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export const getAuthToken = () => authToken;

export const setAuthToken = (token) => {
  authToken = token || null;
  if (authToken) {
    sessionStorage.setItem(TOKEN_KEY, authToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Auto-logout signal on 401 — listen for 'session-expired' to redirect to login.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
    return Promise.reject(error);
  },
);

// --- Auth ---

/** Log in with the OAuth2 form flow. Stores and returns the bearer token. */
export const login = async (username, password) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  const { data } = await apiClient.post('/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  setAuthToken(data.access_token);
  return data;
};

export const logout = () => setAuthToken(null);

/** True if the backend is reachable (used by the online/offline indicator). */
export const checkBackendStatus = async () => {
  try {
    await apiClient.get('/docs', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

// --- Accounts & transactions ---

/** List all accounts: [{ account_id, iban, customer_id }]. ~1000 rows. */
export const getAccounts = async () => (await apiClient.get('/accounts')).data;

/** Find one account by IBAN, or null. */
export const findAccountByIban = async (iban) => {
  const accounts = await getAccounts();
  return accounts.find((a) => a.iban === iban) || null;
};

/** Full transaction ledger for an account_id. */
export const getTransactions = async (accountId) =>
  (await apiClient.get(`/transactions/${accountId}`)).data;

/**
 * Balance inquiry by IBAN — backend-computed balance, overdraft limit, and recent
 * transactions in one call:
 * { iban, account_id, current_balance_eur, overdraft_limit_eur,
 *   available_balance_eur, recent_transactions: [...] }
 */
export const getBalanceByIban = async (iban) =>
  (await apiClient.post('/balance-inquiry', { iban })).data;

// --- Transfer ---

/**
 * Transfer between two IBANs. Returns
 * { status: 'POSTED', debit_tx, credit_tx, new_balance_eur, ... } on success.
 * Over-balance transfers reject with HTTP 403 and { detail: 'Insufficient funds...' }.
 */
export const transferByIban = async (sourceIban, destinationIban, amountEur) => {
  const { data } = await apiClient.post('/iban-transfer', {
    source_iban: sourceIban,
    destination_iban: destinationIban,
    amount_eur: amountEur,
  });
  return data;
};

// --- Overdraft request (client-side only; not a teller API capability) ---

/** Build the back-office overdraft request message (0–10,000 EUR). */
export const buildOverdraftRequest = (iban, amount) => {
  if (amount < 0 || amount > 10000) {
    throw new Error('Overdraft amount must be between 0 and 10,000 EUR');
  }
  return (
    `Overdraft Request\n\n` +
    `Account: ${iban}\n` +
    `Requested Overdraft Amount: €${Number(amount).toFixed(2)}\n\n` +
    `This request requires back-office approval.`
  );
};

export default apiClient;
