import { Injectable } from '@angular/core';
import { map, mergeMap, } from 'rxjs/operators';
import { Book } from 'api/models/book';
import { MeteorObservable } from 'meteor-rxjs';
import { Copies } from 'api/collections/copies';
import { Books } from 'api/collections/books';
import { DoubanProvider } from 'providers/book/douban';


@Injectable()
export class CopyProvider {

  constructor( public douban: DoubanProvider) {
  }

  addCopy(isbn: string) {
    return this.douban.getBookFromDouban(isbn).pipe(
      mergeMap((book: Book) => {
        return MeteorObservable.call('addCopy', book).pipe(
          map((copyId) => {
            const bookId = Copies.findOne(copyId).bookId;
            return Books.findOne(bookId);
          }));
      })
    );
  }
}
