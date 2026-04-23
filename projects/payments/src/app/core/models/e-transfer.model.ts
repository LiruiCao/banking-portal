import { Recipient } from './recipient.model';
import { Account } from './account.model';

export interface ETransferDraft {
  readonly recipientId: string | null;
  readonly fromAccountId: string | null;
  readonly amountCents: number | null;
  readonly memo: string;
  readonly securityQuestion: string;
  readonly securityAnswer: string;
}

export interface ETransferRequest {
  readonly recipient: Recipient;
  readonly fromAccount: Account;
  readonly amountCents: number;
  readonly memo: string;
  readonly securityQuestion: string | null;
  readonly securityAnswer: string | null;
}

export interface ETransferReceipt {
  readonly confirmationNumber: string;
  readonly submittedAt: string;
  readonly request: ETransferRequest;
}

export const ETRANSFER_LIMITS = {
  minCents: 100, // $1.00
  maxPerTransferCents: 300_000, // $3,000 — matches most Canadian banks' default daily limit per transfer
  memoMaxLength: 400,
} as const;

// 两个类型:ETransferDraft 和 ETransferRequest

// Draft 是表单进行中的状态,所有字段可以是 null(用户还没填)
// Request 是提交时的状态,所有字段都必填
// 这是 state modeling 的经典 pattern:通过类型强制"只有填完整才能提交"。senior devloper。

// ETRANSFER_LIMITS as const`:TypeScript 字面量锁定,常量值不会被误改
// 300_000 分:$3,000 是加拿大大多数银行的 per-transfer 默认上限,真实数字不是拍脑袋
// memoMaxLength: 400:Interac 的真实限制
