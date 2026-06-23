import { Transaction } from '../models/index';

/**
 * Hardcoded mock history, kept out of the reducer's initial state so the
 * component goes through the real idle → loading → loaded lifecycle.
 * amountCents uses numeric separators so the dollar value is readable at a glance.
 */
export const MOCK_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'txn_01',
    date: '2026-05-28T14:22:00Z',
    recipientName: 'Emily Chen',
    amountCents: 125_00, // $125.00
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_02',
    date: '2026-05-24T09:10:00Z',
    recipientName: 'Marcus Rivera',
    amountCents: 1_450_00, // $1,450.00
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_03',
    date: '2026-05-21T18:45:00Z',
    recipientName: 'Priya Sharma',
    amountCents: 75_50, // $75.50
    currency: 'CAD',
    status: 'pending',
  },
  {
    id: 'txn_04',
    date: '2026-05-17T11:03:00Z',
    recipientName: 'David Tremblay',
    amountCents: 3_000_00, // $3,000.00 — at the per-transfer limit
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_05',
    date: '2026-05-12T16:30:00Z',
    recipientName: 'Marcus Rivera',
    amountCents: 220_00, // $220.00
    currency: 'CAD',
    status: 'failed',
  },
];
