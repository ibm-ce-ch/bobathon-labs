import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AccountDetails from './pages/AccountDetails';
import Transfer from './pages/Transfer';
import OverdraftRequest from './pages/OverdraftRequest';

// Routing for the teller app. The authenticated area is wrapped in <Layout>, which
// is a TEMPORARY scaffold — replace it with a Carbon UI Shell (AppShell) per SPEC.md.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/overdraft" element={<OverdraftRequest />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
