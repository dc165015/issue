import { ID, } from "./share-models";
import { DocModel } from "./doc-model";

export enum OrderStatus {
  REQUESTED = '求借',
  REQUEST_CANCELLED = '已取消（书主过期未批准）',
  REQUEST_EXPIRED = '已取消（借书人已取消）',

  // @v1: 书主一旦同意，即表示借阅已开始；
  // TODO: @v2 中涉及的租押金时，需要双方确认后才算作开始借阅
  LENDING = '借阅中',
  REJECTED = '书主拒绝',

  // TODO: @v1: 加入续借申请和批准功能
  // RENEW_REQUESTED_EXPIRED = '申请续借',
  // RENEW_REJECTED = '借阅中（拒绝续借）',
  // RENEW_REJECTED_OVERDUE = '已逾期（拒绝续借）',

  OVERDUE = '已逾期',
  COMPLETED_LOST = '已遗失',

  // TODO: @v1: 加入评价功能
  // WAIT_BOTH_COMMENT = '待互评',
  // WAIT_BORROWER_COMMENT = '待借书人评价',
  // WAIT_LENDER_COMMENT = '待书主评价',

  COMPLETED = '已完成',
}

// 自动根据order state判断
export enum OrderPhase {
  TO_LEND = '求借',
  LENDING = '借阅中',
  TO_RATE = '待评价',
  CANCELLED = '已取消',
  COMPLETED = '已完成',
}

export interface OrderState  {
  current?: OrderStatus;
  description?: string;

  updatedBy?: ID;
}

export class Order extends DocModel {

  _id?: ID;
  copyId: ID;
  bookId: ID;

  ownerId: ID;
  borrowerId: ID;

  state?: OrderState[];
}
