import { publishComposite } from 'meteor/reywood:publish-composite';
import { requireLogin } from '../lib/util';
import { Copies } from '../collections/copies';
import { Books } from '../collections/books';
import { Orders } from '../collections/orders';
import { User } from '../models/user';
import { Users } from '../collections/users';
import { Copy } from '../models/copy';
import { Book } from '../models/book';
import { Order } from '../models/order';

publishComposite('ordersWithWho', function(
    pattern: { borrowerId?: string; ownerId?: string },
    batchCounter: number = 1,
): PublishCompositeConfig<Order> {
    requireLogin();
    check(batchCounter, Number);
    check(pattern, { borrowerId: Match.Maybe(String), ownerId: Match.Maybe(String) });

    let selector,
        myId = this.userId;
    if (pattern.borrowerId && pattern.borrowerId != myId) selector = { borrowerId: pattern.borrowerId, ownerId: myId };
    else if (pattern.ownerId && pattern.ownerId != myId) selector = { borrowerId: myId, ownerId: pattern.ownerId };
    else selector = { $or: [ { borrowerId: myId }, { ownerId: myId } ] };

    return {
        find() {
            return Orders.collection.find(selector, { limit: 30 * batchCounter });
        },
        children: [
            <PublishCompositeConfig1<Order, Book>>{
                find(order) {
                    return Books.collection.find(order.bookId);
                },
            },
            <PublishCompositeConfig1<Order, User>>{
                find(order) {
                    return Users.collection.find(order.borrowerId);
                },
            },
            <PublishCompositeConfig1<Order, Copy>>{
                find(order) {
                    return Copies.collection.find(order.copyId);
                },
            },
        ],
    };
});
