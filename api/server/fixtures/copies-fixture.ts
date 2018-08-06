import { Copy } from "../models/copy";
import { getUser, getUserCount } from "./users-fixture";
import { Copies } from "../collections/copies";
import { getBookCount, getBook } from "./books-fixture";
import { Users } from "../collections/users";
import { User } from "../models/user";

export function getCopiesPerUser(copiesPerUser?: number) {
  let userCount = getUserCount();
  const bookCount = getBookCount();
  if (!userCount) throw new Error('no any user to create copies.');
  if (!bookCount) throw new Error('no any book to create copies.');
  while (userCount--) {
    let count = copiesPerUser;
    while (count--) insertCopy();
  }
}

function insertCopy(bookId?: string, ownerId?: string) {
  bookId = bookId || getBook()._id;
  ownerId = ownerId || getUser()._id;
  Copies.collection.insert(new Copy(bookId, ownerId));
}

export function findWhoHasMostCopies() {
  let no1: User, no1CopiesCount = 0;
  Users.collection.find({}, { fields: { phone: 1 } })
    .forEach(<User>(user) => {
      const count = Copies.collection.find({ownerId: user._id}).count();
      if (count > no1CopiesCount) {
        no1 = user;
        no1CopiesCount = count;
      }
    });
  Users.collection.update(no1._id, { $set: {'phone.number': '+8613333344444'}});
  if (no1) console.log(`用户(ID: ${no1._id}, 手机: 13333344444 ) 藏书最多(${no1CopiesCount}册).`);
  return no1;
}
