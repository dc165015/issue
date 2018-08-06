import { Component, } from '@angular/core';
import { NavController, NavParams, SegmentButton } from 'ionic-angular';
import { User } from 'api/models/user';
import { ToastProvider } from 'providers/toast/toast';
import { ChatsPage } from 'pages/chats/chats';
import { Meteor } from "meteor/meteor";
import { Copies } from 'api/collections/copies';
import { Orders } from 'api/collections/orders';
import { Order } from 'api/models/order';
import { MeteorObservable } from 'meteor-rxjs';
import { Copy } from 'api/models/copy';

@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  isEditting: boolean = false;
  user: User;
  display: string = "userCopies";
  loading: any;
  borrowedOrders: Order[];
  borrowedBatchCounter = 1;
  lentOrders: Order[];
  lentBatchCounter = 1;
  userCopies: Copy[];
  userCopiesBatchCounter = 1;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toast: ToastProvider,
  ) {
    this.user = this.navParams.get('user') || User.me;
    MeteorObservable.subscribe('userCopies',  this.user._id).subscribe(() => {
      this.user = Meteor.users.findOne(this.user._id) as User;
      // if (this.user) {
        // this.ref.detectChanges();
        // May need to triger view update manually, see https://stackoverflow.com/questions/34827334/triggering-change-detection-manually-in-angular
      // }
    });
  }

  openChatsPage(ev) {
    this.navCtrl.push(ChatsPage);
  }

  onSegmentChanged(segmentButton: SegmentButton) {
    console.log('Segment changed to', segmentButton.value);
  }

  onSegmentSelected(segmentButton: SegmentButton) {
    this.display = segmentButton.value;
    this.getData(this.display);
  }

  getBorrowedOrdersList() {
    const selector = { borrowerId: this.user._id };
    MeteorObservable.subscribe('myOrders', selector, this.borrowedBatchCounter++).subscribe(() => {
      this.borrowedOrders = Orders.find(selector).fetch();
    }, (err)=>this.toast.presentError(err));
    return this.borrowedOrders;
  }

  getLentOrdersList() {
    const selector = { ownerId: this.user._id };
    MeteorObservable.subscribe('myOrders', selector, this.borrowedBatchCounter++).subscribe(() => {
      this.lentOrders = Orders.find(selector).fetch();
    }, (err)=>this.toast.presentError(err));
    return this.lentOrders;
  }

  getUserCopiesList() {
    MeteorObservable.subscribe('userCopies', this.user._id, this.userCopiesBatchCounter++).subscribe(() => {
      this.userCopies = Copies.find({ ownerId: this.user._id }).fetch();
    });
    return this.userCopies;
  }

  private getData(type: string) {
    switch (type) {
      case 'borrowed':
        return this.getBorrowedOrdersList();
      case 'lent':
        return this.getLentOrdersList();
      case 'userCopies':
        return this.getUserCopiesList();
    }
  }

  doInfinite(){
    return this.getData(this.display);
  }
}

