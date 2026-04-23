import { Account } from '../models/index';

export const MOCK_ACCOUNTS: readonly Account[] = [
  {
    id: 'acc_01',
    kind: 'chequing',
    nickname: 'Everyday Chequing',
    maskedNumber: '****4821',
    balanceCents: 842_35,
    currency: 'CAD',
  },
  {
    id: 'acc_02',
    kind: 'savings',
    nickname: 'High Interest Savings',
    maskedNumber: '****6103',
    balanceCents: 12_430_00,
    currency: 'CAD',
  },
];

// 842_35 而不是 84235 —— TypeScript 数字分隔符,清楚表达 $842.35
// 12_430_00 = $12,430.00 —— 同理,肉眼能读
// 两个账户:chequing 和 savings,Interac 通常只允许从 chequing 转账(Step 2 里会做这个业务规则演示)
