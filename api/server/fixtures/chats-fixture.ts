import { Chats } from '../collections/chats';
import { Messages } from '../collections/messages';
import { MessageType, } from '../models/message';
import { randomAvatarUrl, } from './util';
import { Factory } from "meteor/dburles:factory";
import { sampleUsers, getUser } from './users-fixture';
import { faker } from "meteor/practicalmeteor:faker";

export function getChat(isRandom: boolean = false) {
  const selector = isRandom ? { createdAt: { $gte: faker.date.past() } } : {};
  const existing = Chats.collection.findOne(selector);
  return existing || Factory.create("chat");
}

export function getMessage(isRandom: boolean = false) {
  const selector = isRandom ? { createdAt: { $gte: faker.date.past() } } : {};
  const existing = Messages.collection.findOne(selector);
  return existing || Factory.create("message");
}

export function getMessages(limit = 2) {
  const messages = [];
  const existing = Messages.collection.find({}, { limit }).fetch();
  let user0, user1;
  let chat;
  for (let i = 0; i < limit; i++) {
    let msg = existing[i];
    if (!msg) {
      if (i==0 || Math.random() > 0.8) {
        [user0, user1] = sampleUsers(2);
        chat = Factory.create('chat', { memberIds: [user0._id, user1._id] });
      }
      msg = Factory.create('message', { chatId: chat.id, senderId: user0._id });
    }

    messages.push(msg);
  }
  return messages;
}

const randomChat = {
    title: faker.name.findName,
    createAt: faker.date.past,
    picture: randomAvatarUrl,
    memberIds: [getUser()._id, getUser()._id],
  };

Factory.define('chat', Chats.collection, randomChat);

const randomMessage = {
    chatId: getChat(true)._id,
    content: faker.lorem.paragraph,
    createdAt: faker.date.past,
    senderId: getUser()._id,
    type: MessageType.TEXT
  };

Factory.define('message', Messages.collection, randomMessage);
