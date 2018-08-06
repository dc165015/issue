import { publishComposite } from 'meteor/reywood:publish-composite';
import { requireLogin } from '../lib/util';
import { Copies } from '../collections/copies';
import { Books } from '../collections/books';
import { User } from '../models/user';
import { Users } from '../collections/users';
import { Copy } from '../models/copy';
import { Book } from '../models/book';
import { Pictures } from '../collections/pictures';
import { Picture } from '../models/picture';
import { Match } from 'meteor/check';

publishComposite('myData', function(): PublishCompositeConfig<User> {
    requireLogin();
    return {
        find() {
            return Users.collection.find(this.userId, { fields: { profile: 1, settings: 1 } });
        },
        children: [
            <PublishCompositeConfig1<User, Picture>>{
                find: (user) => {
                    return Pictures.collection.find(
                        { _id: user.profile && user.profile.pictureId },
                        { fields: { url: 1 } },
                    );
                },
            },
            <PublishCompositeConfig1<User, Copy>>{
                find: (user) => {
                    return Copies.collection.find({ ownerId: user._id }, { limit: 50 });
                },
                children: [
                    <PublishCompositeConfig2<User, Copy, Book>>{
                        find: (copy) => {
                            return Books.collection.find(copy.bookId);
                        },
                    },
                ],
            },
        ],
    };
});

publishComposite('users', function(pattern?: any, batchCounter: number = 1): PublishCompositeConfig<User> {
    requireLogin();
    check(pattern, { _id: Match.Maybe(String), profileName: Match.Maybe(String) });
    check(batchCounter, Number);
    if (30 * batchCounter > 500) return new Match.Error('获取用户超过500个上限');

    let selector = {};
    if (pattern) {
        let target;
        if ((target = pattern._id)) selector = { _id: target };
        if ((target = pattern.profileName)) selector = { 'profile.name': { $regex: target, $options: 'i' } };
    }

    return {
        find: () => <Mongo.Cursor<User>>Users.collection.find(selector, { limit: 30 * batchCounter }),
        children: [
            <PublishCompositeConfig1<User, Picture>>{
                find: (user) => {
                    if (user.profile && user.profile.pictureId)
                        return Pictures.collection.find({ _id: user.profile.pictureId }, { fields: { url: 1 } });
                },
            },
        ],
    };
});
