import { ID, } from "./share-models";
import { Message } from "./message";
import { DocModel } from "./doc-model";

export class Chat extends DocModel {
  _id?: ID;
  title?: string;
  picture?: string;
  lastMessage?: Message;
  memberIds?: ID[];
}
