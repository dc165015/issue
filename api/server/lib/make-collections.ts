import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { DocModel } from '../models/doc-model';

export function makeCollection<T extends DocModel>(
    collectionName: string,
    model?: any,
    options: { [key: string]: any } = {},
): MongoObservable.Collection<T> {
    const _options =
        model && Meteor.isClient ? Object.assign({ transform: (doc) => model.wrapDoc(doc) }, options) : options;

    const collection = new Mongo.Collection<T>(collectionName, _options);

    installCollectionHooks(collection);

    if (Meteor.isDevelopment) {
        registerCollectionsToMeteor(collectionName, collection);
    }

    if (model) model.collection = collection;

    return new MongoObservable.Collection<T>(collection);
}

function installCollectionHooks(collection: Mongo.Collection<any>) {
    collection.before.insert(function(userId, doc) {
        doc.createdAt = Date.now();
    });

    collection.before.find(function(userId, selector, options) {
        if (!options || !options['sort']) options = Object.assign({ sort: { createdAt: -1 } }, options);
    });

    collection.before.update(function(userId, doc, fieldNames, modifier, options) {
        modifier.$set = modifier.$set || {};
        modifier.$set.updatedAt = Date.now();
    });
}

function registerCollectionsToMeteor(collectionName: string, collection: Mongo.Collection<any>) {
    const collectionsMap = (Meteor.collections = Meteor.collections || new Map());
    collectionsMap.set(collectionName, collection);
}
