import { requireLogin, checkId } from '../lib/util';
import { Copies } from '../collections/copies';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { Copy } from '../models/copy';
import { Books } from '../collections/books';
import { Book } from '../models/book';

publishComposite('userCopies', function(userId: string, batchCounter: number = 1): PublishCompositeConfig<Copy> {
    requireLogin();
    checkId(userId);
    check(batchCounter, Number);

    return {
        find() {
            return Copies.collection.find(userId, { limit: 30 * batchCounter });
        },
        children: [
            <PublishCompositeConfig1<Copy, Book>>{
                find(copy) {
                    return Books.collection.find({ _id: copy.bookId });
                },
            },
        ],
    };
});
