import { HTTP } from "meteor/http";
import { Book } from "../models/book";
import { Books } from "../collections/books";

let timer = 1000, bookCount: number, i = 0;

export function getBook() {
  return getRandomExistedBook();
}

export function getBookCount() {
  return bookCount = bookCount || Books.collection.find().count();
}

export function getRandomExistedBook() {
  const skip = Math.floor(Math.random() * getBookCount());
  return Books.collection.findOne({}, { skip });
}

export function getBooks(count: number = 450) {
  intervalRequest(count);
}

function getBookUrl(id?: string) {
  id = id || randomBookId();
  return `https://api.douban.com/v2/book/${id}`;
}

function randomBookId() {
  const seed = Math.random();
  return '1' + Math.floor(seed * 1000000);
}

const syncHttpGet = Meteor.wrapAsync(HTTP.get, HTTP);

function syncGetDoubanBook(id?: string) {
  let res;
  try {
    const url = getBookUrl(id);
    res = syncHttpGet(url, { timeout: 5000 });
  } catch (err) {
    handleError(err);
    return;
  }
  return res.data;
}

function asyncGetDoubanBook(id?: string) {
  HTTP.call('GET', getBookUrl(id), {}, (err, res) => {
    if (err) {
      handleError(err);
    } else {
      insertBook(res.data);
    }
  });
}

function handleError(err): number {
  const code = err.response.statusCode;
  if (code == 400) {
    // 超出每小时150次限制，设置后续等待时间
    timer = 60 * 60 * 1000 - timer * 150;
    console.warn(err.message);
  }
  else if (code != 404) console.error(err.message);
  else console.log('not found.');
  return code;
}

// 参考豆瓣api限制： https://developers.douban.com/wiki/?title=api_v2
// 每小时150次
function intervalRequest(count: number) {
  Meteor.setTimeout(() => {
    timer = 1000;
    makeDoubanBook();
    if (count) intervalRequest(count);
  }, timer);
}

function makeDoubanBook() {
  console.log(`Try #${i++}: `);
  const doc = syncGetDoubanBook();
  if (doc) insertBook(doc);
}

function insertBook(doc) {
  if (Books.collection.findOne({ id: doc.id }))
    return console.log(`Book <<${doc.title}>>(id: ${doc.id}) already existed.`);
  const book = Book.wrapDoc(doc) as Book;
  const bookId = Books.collection.insert(book);
  console.log(`>>> ${book.title} inserted.`);
  console.log(`total ${Books.collection.find().count()} books.`);
  return Books.findOne(bookId);
}
