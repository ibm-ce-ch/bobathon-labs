import React from 'react';
import { useParams } from 'react-router-dom';

// TODO (SPEC.md — Account Details): show the account's balance and a sortable,
// filterable transaction history table. Use getBalanceByIban() for the computed
// balance + overdraft, or sum getTransactions(accountId). Format with utils/formatters.
const AccountDetails = () => {
  const { accountId } = useParams();
  return <h2>Account Details for {accountId} — TODO: build per SPEC.md</h2>;
};

export default AccountDetails;
