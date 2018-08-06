import { publishComposite } from 'meteor/reywood:publish-composite';
import { Chats } from '../collections/chats';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { Messages } from '../collections/messages';
import { User } from '../models/user';
import { Users } from '../collections/users';
import { requireLogin } from '../lib/util';

publishComposite('chats', function(): PublishCompositeConfig<Chat> {
    requireLogin();

    return {
        find: () => Chats.collection.find({ memberIds: this.userId }),
        children: [
            <PublishCompositeConfig1<Chat, Message>>{
                find: (chat) => Messages.collection.find({ chatId: chat._id }, { limit: 1 }),
            },
            <PublishCompositeConfig1<Chat, User>>{
                find: (chat) => {
                    return Users.collection.find({ _id: { $in: chat.memberIds } }, { fields: { profile: 1 } });
                },
            },
        ],
    };
});
