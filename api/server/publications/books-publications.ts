import { Books } from '../collections/books';
import { requireLogin } from '../lib/util';
import { Users } from '../collections/users';
import { Pictures } from '../collections/pictures';
import { Copies } from '../collections/copies';

Meteor.publish('book', function({ isbn13, _id }) {
    check(isbn13, Match.Maybe(String));
    check(_id, Match.Maybe(String));

    if (_id) {
        return Books.collection.find({ _id });
    } else if (isbn13) {
        return Books.collection.find({ isbn13 });
    }
});

Meteor.publish('booksOfCommunity', function({ communityId }, batchCount: number = 1) {
    requireLogin();
    check(communityId, Match.Maybe(String));

    const selector = communityId ? { communityIds: communityId } : {};
    const users = Users.collection.find(selector, { limit: batchCount * 30 });
    const userIds = users.map((user) => user._id);
    const userPicIds = users.map((user) => (user.profile ? user.profile.pictureId : ''));
    const pictures = Pictures.collection.find({ _id: { $in: userPicIds } }, { fields: { url: 1 } });
    const copies = Copies.collection.find({ ownerId: { $in: userIds } }, { limit: batchCount * 100 });
    const books = Books.collection.find({ _id: { $in: copies.map((copy) => copy.bookId) } });
    return [ books, users, copies, pictures ];
});
