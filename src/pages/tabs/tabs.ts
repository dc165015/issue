import { Component } from '@angular/core';
import { Tab1Root, Tab2Root, Tab3Root, Tab0Root } from '..';
import { NavController } from 'ionic-angular';
import { User } from 'api/models/user';
import { MyProfileEditPage } from 'pages/my-profile-edit/my-profile-edit';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab0Root: any = Tab0Root;
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;

  tab0Title = "书目";
  tab1Title = "书友";
  tab2Title = "借还";
  tab3Title = "我";

  constructor(public navCtrl: NavController) {
    if (!User.me.isProfiled) {
      this.navCtrl.push(MyProfileEditPage, {}, { animate: true });
    }
  }
}
