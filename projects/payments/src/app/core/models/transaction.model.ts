export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  readonly id: string;
  readonly date: string; // ISO 8601 — API 层用 string,UI 层用 DatePipe 转
  readonly recipientName: string;
  /** Amount in cents to avoid floating-point errors */
  readonly amountCents: number;
  readonly currency: 'CAD';
  readonly status: TransactionStatus;
}

// status: union type,不是多个 boolean —— 同 Account 的 kind / Recipient 的 channel。
// amountCents + currency: 'CAD' literal —— 与 Account 一致:金融金额永远用 cents,币种锁字面量。
