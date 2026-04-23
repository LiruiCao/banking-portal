export type AccountKind = 'chequing' | 'savings';

export interface Account {
  readonly id: string;
  readonly kind: AccountKind;
  readonly nickname: string;
  readonly maskedNumber: string;
  /** Balance in cents to avoid floating-point errors */
  readonly balanceCents: number;
  readonly currency: 'CAD';
}

// balanceCents: number 不是 balance: number:金融计算永远不用浮点数。$100.05 存成 10005,运算完再除 100 格式化。
//  payment project like this。
// currency: 'CAD' 是 literal type,不是 string:未来扩展多币种时,改这个字段就改约束
// maskedNumber:展示用 ****1234,不暴露真实账号
// kind: 'chequing':加拿大拼法,美国是 checking,细节处体现本地化
