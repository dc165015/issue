import { Book } from '../models/book';
import { makeCollection } from '../lib/make-collections';
import { MongoInternals } from 'meteor/mongo';
import { MongoObservable } from 'meteor-rxjs';

let options;

if (Meteor.isServer) {
    const _driver = new MongoInternals.RemoteCollectionDriver(
        'mongodb://dc:dc@localhost:8084/douban',
        // { oplogUrl: "mongodb://localhost:8084/local" }
    );
    options = { _driver };
}

export const Books = makeCollection<Book>('books', Book, options) as IBooks;

if (Meteor.isServer) Books.rawCollection().createIndex({ id: 1, source: 1 }, { unique: true });

interface IBooks extends MongoObservable.Collection<Book> {
    groupByTag?: (books: Book[]) => Map<string, Book[]>;
    sortGroups?;
}

Books.groupByTag = function(books: Book[]) {
    const groups: Map<string, Book[]> = new Map();
    groups.set('全部', []);
    groups.set('无标签', []);

    books.reduce((groups, book: Book) => {
        const tags = book.tags;
        if (!tags || !tags.length) {
            groups.get('无标签').push(book);
        } else {
            tags.forEach((tag) => {
                let group = groups.get(tag.name) || [];
                group.push(book);
                groups.set(tag.name, group);
            });
            groups.get('全部').push(book);
        }
        return groups;
    }, groups);

    return Books.sortGroups(groups);
};

Books.sortGroups = function(groups: Map<string, Book[]>) {
    const newGroups = new Map();
    const tags = Array.from(groups.keys());

    // 先按标签长度从短到长排序, 若长度相同再按标签下书的数量从多到少排序
    tags.sort((a, b) => a.length - b.length || groups.get(b).length - groups.get(a).length);
    tags.forEach(tag => newGroups.set(tag, groups.get(tag)));

    return newGroups;
};
