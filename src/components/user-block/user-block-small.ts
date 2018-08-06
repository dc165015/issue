import { NavController } from 'ionic-angular';
import { Component, Input, } from '@angular/core';
import { UserProfilePage } from 'pages/user-profile/user-profile';

@Component({
    selector: 'user-block-small',
    templateUrl: 'user-block-small.html',
})
export class UserBlockSmallComponent  {
    @Input() user: any;
    picture: string;

    constructor(public navCtrl: NavController) {}

    openDetailsPage(ev) {
        this.navCtrl.push(UserProfilePage, { user: this.user });
    }
}
