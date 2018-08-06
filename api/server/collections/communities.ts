import { makeCollection } from "../lib/make-collections";
import { Community } from "../models/community";

export const Communities = makeCollection<Community>('communities', Community);

// collection.attachSchema;
Communities.collection.before.insert(function(userId, doc){
    if(userId) doc.createdBy = userId;
});

Communities.collection.before.update(function (userId, doc) {
    if (userId) doc.updatedBy = userId;
})
