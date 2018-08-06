import { NavController } from 'ionic-angular';
import { Component, Input, } from '@angular/core';
import { BookProfilePage } from 'pages/book-profile/book-profile';

@Component({
  selector: 'book-block-small',
  templateUrl: 'book-block-small.html'
})
export class BookBlockSmallComponent {
  @Input() book: any;

  constructor(public navCtrl: NavController) { }

  // get title() {
  //   let str = this.book.title;
  //   return str.length < 12 ? str : str.substring(0, 11).concat('...');
  // }

  openDetailsPage(ev) {
    this.navCtrl.push(BookProfilePage, { book: this.book });
  }
}
