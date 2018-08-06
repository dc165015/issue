import { Copy } from '../models/copy';
import { makeCollection } from '../lib/make-collections';
import { Users } from './users';
import { Communities } from './communities';

export const Copies = makeCollection<Copy>('copies', Copy);

// collection.attachSchema;

Copies.collection.after.insert((userId, copy) => {
    let owner = Users.collection.findOne(copy.ownerId);
    Users.collection.update(copy.ownerId, { $inc: { 'profile.ownedCopyCount': 1 } });

    if (owner.communityIds && owner.communityIds.length)
        Communities.update({ _id: { $in: owner.communityIds } }, { $inc: { copyCount: 1 } });
});
