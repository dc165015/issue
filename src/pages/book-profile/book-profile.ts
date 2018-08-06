import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Book } from 'api/models/book';

@Component({
  selector: 'page-book-profile',
  templateUrl: 'book-profile.html',
})
export class BookProfilePage {
  book:Book;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alert: AlertController) {
    this.book = navParams.get('book');

    if (navParams.get('isScanning')) {
      this.alert.create({
        title: '上传完成,要继续扫描吗？',
        buttons: [{
          text: '好的',
          handler() {
            this.navCtrl.pop();
          }
        }, {
          text: '取消',
          role: 'cancel'
        }]
      }).present();
    }
  }

  get mainTags() {
    return this.book.tags.sort((a, b) => b.count - a.count).slice(0, 5);
  }

  get authorAndTranslator() {
    let translator: string = this.book.translator.join();

    return this.book.author.join(' ') + (translator.length > 0 ? ` / 译者：${translator}` : '');
  }

  get otherConditions() {
    return `${this.book.pages}页 / ${this.book.binding} / ${this.book.price} / ${this.book.publisher}`;
    // / ${this.book.pubdate} / ISBN:${this.book.isbn13 || this.book.isbn10}`;
  }

  get shortSummary() {
    return this.book.summary;
  }

}
