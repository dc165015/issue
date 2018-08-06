import { requireLogin } from '../lib/util';
import { Users } from '../collections/users';
import { Pictures } from '../collections/pictures';
import { Communities } from '../collections/communities';

Meteor.publish('membersOfCommunities', function(communityIds, batchCount: number = 1) {
    requireLogin();
    check(communityIds, Match.Maybe([ String ]));
    check(batchCount, Number);

    // TODO: add private community type
    const communities = Communities.collection.find({ _id: { $in: communityIds } }, { limit: 3 * batchCount });
    const fetchedCommunityIds = communities.map((community) => community._id);
    const users = Users.collection.find({ communityIds: { $in: fetchedCommunityIds } }, { limit: batchCount * 30 });
    const picIds = users.map((user) => (user.profile ? user.profile.pictureId : ''));
    const pictures = Pictures.collection.find({ _id: { $in: picIds } }, { fields: { url: 1 } });
    return [ communities, users, pictures ];
});
