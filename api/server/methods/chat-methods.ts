import { Chats } from '../collections/chats';
import { requireLogin, checkId } from '../lib/util';
import { Chat } from '../models/chat';

Meteor.methods({
  addChat(receiverId: string) {
    requireLogin();
    checkId(receiverId);

    if (receiverId === this.userId) {
      throw new Meteor.Error('无效的聊天对象', '不能和自己聊天');
    }

    const chatExists = !!Chats.collection.find({
      memberIds: { $all: [this.userId, receiverId] }
    }).count();

    if (chatExists) {
      throw new Meteor.Error('聊天已存在', '双方已有聊天记录，不可新启');
    }

    Chats.insert({ memberIds: [this.userId, receiverId] } as Chat);
  },

  removeChat(chatId: string) {
    requireLogin();
    checkId(chatId);

    const chat= Chats.collection.findOne(chatId);

    if (!chat) {
      throw new Meteor.Error('聊天记录不存在', '要删除的记录不存在');
    }

    if (!chat.memberIds.find(id => id === this.userId)) {
      throw new Meteor.Error('无权删除别人的记录', '无权删除别人的聊天记录');
    }

    // TODO: 聊天双方中有某一人标记删除，另一方应仍然可见；无论谁删除，服务器仅保留删除人id，服务器不真的删除记录。 @v1
    Chats.remove(chatId);
  }
});
