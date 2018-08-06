import { Component } from '@angular/core';
import { ViewController, App } from 'ionic-angular';

@Component({
  template: `<ion-list>
    <button ion-item (click)="close()">查看本群书库</button>
  </ion-list>`,
})
export class PopoverMenu {
  constructor(
    public viewCtrl: ViewController,
    public appCtrl: App
  ) {
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
