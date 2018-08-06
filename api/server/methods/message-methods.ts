import { Chats } from '../collections/chats';
import { Messages } from '../collections/messages';
import { check, Match } from 'meteor/check';
import { requireLogin, clampString, checkId } from '../lib/util';
import { MAX_MESSAGE_LENGTH } from '../lib/constants';
import { MessageType, Message } from '../models/message';

Meteor.methods({
  addMessage(type: MessageType, chatId: string, content: string) {
    requireLogin();

    check(type, Match.OneOf(String, [ MessageType.TEXT, MessageType.LOCATION ]));
    checkId(chatId);
    clampString(content, 1, MAX_MESSAGE_LENGTH);
    // TODO: filter malicious content

    const chatExists = !!Chats.collection.find(chatId).count();

    if (!chatExists) {
      throw new Meteor.Error('chat-not-exists', "Chat doesn't exist");
    }

    return {
      messageId: Messages.collection.insert({
        chatId: chatId,
        senderId: this.userId,
        content: content,
        createdAt: new Date(),
        type: type,
      } as Message),
    };
  },

  countMessages(): number {
    return Messages.collection.find().count();
  },
});
