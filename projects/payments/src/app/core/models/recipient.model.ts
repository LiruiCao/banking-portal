export type RecipientChannel = 'email' | 'phone';

export interface Recipient {
  readonly id: string;
  readonly name: string;
  readonly channel: RecipientChannel;
  /** Email address if channel is 'email', E.164 phone number otherwise */
  readonly handle: string;
  readonly autoDeposit: boolean;
  readonly lastUsedAt?: string;
}

// readonly:不可变对象,这是函数式编程在 TypeScript 的体现,资深工程师习惯
// Union type 'email' | 'phone':Interac 支持这两种收款方式
// autoDeposit:Interac 真实特性——收款人开通了 auto-deposit 就不需要安全问题,这个字段后面会用来决定 Step 3 是否跳过
// JSDoc 注释:不是每个字段都写,只注释"从字段名看不出"的规则(handle 的格式)
// lastUsedAt?: string:ISO 时间字符串( Date 还是 string? "API 层用 string,UI 层再转 Date 是标准做法")
