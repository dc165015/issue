import { Chat } from '../models/chat';
import { Messages } from './messages';
import { makeCollection } from '../lib/make-collections';

export const Chats = makeCollection<Chat>('chats', Chat);

Chats.collection.after.remove(function (userId, doc) {
    Messages.collection.remove({ chatId: doc._id });
})
