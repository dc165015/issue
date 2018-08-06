import { Messages } from '../collections/messages';
import { requireLogin, checkId } from '../lib/util';
import { Chats } from '../collections/chats';
import { Message } from '../models/message';
import { Match } from 'meteor/check';

Meteor.publish('messages', function(chatId: string, batchCounter: number): Mongo.Cursor<Message> {
    requireLogin();
    checkId(chatId);
    check(batchCounter, Number);

    const chat = Chats.findOne(chatId);

    if (!chat) return;

    if (!chat.memberIds.find(this.userId)) {
        throw new Match.Error('不能查询别人的聊天记录');
    }

    return Messages.collection.find({ chatId }, { limit: 30 * batchCounter });
});
