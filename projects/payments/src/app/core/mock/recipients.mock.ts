import { Recipient } from '../models/index';

export const MOCK_RECIPIENTS: readonly Recipient[] = [
  {
    id: 'rec_01',
    name: 'Emily Chen',
    channel: 'email',
    handle: 'emily.chen@example.com',
    autoDeposit: true,
    lastUsedAt: '2025-10-12T14:22:00Z',
  },
  {
    id: 'rec_02',
    name: 'Marcus Rivera',
    channel: 'email',
    handle: 'marcus.r@example.com',
    autoDeposit: false,
    lastUsedAt: '2025-09-28T09:10:00Z',
  },
  {
    id: 'rec_03',
    name: 'Priya Sharma',
    channel: 'phone',
    handle: '+14165551042',
    autoDeposit: false,
    lastUsedAt: '2025-07-15T18:45:00Z',
  },
  {
    id: 'rec_04',
    name: 'David Tremblay',
    channel: 'email',
    handle: 'd.tremblay@example.com',
    autoDeposit: true,
  },
];

// readonly Recipient[]:mock 数据不能被修改(用户"添加新收款人"会生成新数组,不是 push)
// 名字的多元性:Emily Chen / Marcus Rivera / Priya Sharma / David Tremblay —— 体现加拿大多元文化,真实产品的 UX 感
// id 用字符串前缀 rec_01,不是数字 —— 真实后端 API 大多用 UUID 或前缀化 ID
// 时间戳有/没有 lastUsedAt:David 是"从没转过账的",故意留空,后面可以测试"新收款人警告"的 UX
// 部分 autoDeposit: true:模拟 Interac 的 auto-deposit 特性
