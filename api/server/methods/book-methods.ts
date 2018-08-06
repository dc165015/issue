import { requireLogin } from "../lib/util";
import { Book } from "../models/book";
import { Books } from "../collections/books";

Meteor.methods({
  addBook(book: Book) {
    requireLogin();

    let doc: Book = Books.collection.findOne({ id: book.id, source: book.source });
    if (doc) return doc._id;

    Book.validateObj(book);
    book.tags = Book.fixTags(book.tags);
    return Books.collection.insert(Book.wrapDoc(book) as Book);
  }
});
