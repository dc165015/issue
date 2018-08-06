import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { User } from 'api/models/user';
import { FirstRunPage } from '..';
import { TermsOfServicePage } from 'pages/terms-of-service/terms-of-service';
import { ToastProvider } from 'providers/toast/toast';
import { ChatsPage } from 'pages/chats/chats';
import { MyProfileEditPage } from 'pages/my-profile-edit/my-profile-edit';
import { MyTermsEditPage } from 'pages/my-terms-edit/my-terms-edit';
import { autoSub } from '../../lib/sub';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage implements OnInit {
    settingsForm: FormGroup;
    user: User;

    constructor(
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public navParams: NavParams,
        public modal: ModalController,
        public toast: ToastProvider,
    ) {}

    ngOnInit() {
        autoSub('myData').subscribe(() => {
            this.user = User.me;
        });
    }

    openChatsPage() {
        this.navCtrl.push(ChatsPage);
    }

    logout() {
        this.navCtrl.setRoot(FirstRunPage);
    }

    showTermsModal() {
        let modal = this.modal.create(TermsOfServicePage);
        modal.present();
    }

    openMyPofileEditPage() {
        this.navCtrl.push(MyProfileEditPage);
    }

    openMyTermsEditPage() {
        this.navCtrl.push(MyTermsEditPage);
    }
}
