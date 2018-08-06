import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ToastProvider } from 'providers/toast/toast';
import { BookProfilePage } from 'pages/book-profile/book-profile';
import { CopyProvider } from 'providers/copy/copies';

@Component({
  selector: 'page-new-copy',
  templateUrl: 'new-copy.html',
})
export class NewCopyPage {
  loading;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
    public toast: ToastProvider,
    public copyStore: CopyProvider,
    public loadingCtrl: LoadingController,
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {

  }

  scan() {
    this.barcodeScanner.scan().then(code => {
      this.loading.present();
      this.copyStore.addCopy(code.text).subscribe({
        next: (book) => {
          this.loading.dismiss();
          this.navCtrl.push(BookProfilePage, { book, isScanning: true});
        }
      });
    }).catch(err => {
      this.loading.dismiss();
      this.toast.presentError(err);
    });
  }
}
