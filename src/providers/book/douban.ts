import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { range, timer, Observable } from 'rxjs';
import { filter, map, mergeMap, retryWhen, zip, timeout } from 'rxjs/operators';
import { Book, BookSource } from 'api/models/book';

@Injectable()
export class DoubanProvider {
    constructor(public http: HttpClient) {}

    getBookFromDouban(isbn: string): Observable<Book> {
        return this.http.jsonp(`https://api.douban.com/v2/book/isbn/${isbn}`, 'callback').pipe(
            timeout(1500),
            backOff(),
            map((data: Book) => {
                data.tags = Book.fixTags(data.tags);
                data.source = BookSource.DOUBAN;
                return Book.wrapDoc(data) as Book;
            }),
        );
    }
}

// if error occurred, retry after delay.
function backOff(maxTries: number = 1, delay: number = 250) {
    return retryWhen((errors) => {
        return range(1, maxTries).pipe(
            zip(errors),
            filter((i) => {
                const err = i[1];
                console.log(err);
                const status = err.status;
                return status != 404 && status != 400;
            }),
            map((i) => i[0] ** 2),
            mergeMap((i) => timer(i * delay)),
        );
    });
}
