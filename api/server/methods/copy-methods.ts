import { requireLogin, } from "../lib/util";
import { Book } from "../models/book";
import { Copies } from "../collections/copies";
import { Copy } from "../models/copy";

Meteor.methods({
  addCopy(book: Book) {
    requireLogin();

    let bookId = Meteor.call('addBook', book);

    let copy: Copy = Copies.collection.findOne(bookId); //TODO: if bookID is null, does findOne return null?

    return copy ? copy._id: Copies.collection.insert(new Copy(bookId, this.userId));
  }
});
