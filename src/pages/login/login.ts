import { Component, AfterContentInit, OnInit } from '@angular/core';
import { NavController, Platform, ViewController, LoadingController, Loading } from 'ionic-angular';
import { PhoneProvider } from 'providers/phone/phone';
import { from } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ToastProvider } from 'providers/toast/toast';
import { MainPage } from '..';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage implements AfterContentInit, OnInit {
    terms: boolean = true;
    phone: string = '';
    code: string;
    waiting: number = 0;
    codeButtonText: string = '获取验证码';
    loading: Loading;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public phoneProvider: PhoneProvider,
        public formBuilder: FormBuilder,
        public toast: ToastProvider,
        public platform: Platform,
        public loadingCtrl: LoadingController,
    ) {
        this.loading = this.loadingCtrl.create();
    }

    ngAfterContentInit() {
        if (this.platform.is('cordova')) {
            this.phoneProvider
                .getNumber()
                .then((phone) => (this.phone = removeCountryCode(phone)), (error) => console.error(error.message));
            this.phoneProvider.getSms().then((code) => (this.code = code), (error) => console.error(error.message));
        }
    }

    ngOnInit() {
        if (Meteor.isDevelopment) {
            this.phone = '13333344444';
            this.verify().then(() => { this.code = '1234'; this.doLogin(); });
        }
    }

    verify() {
        if (this.waiting > 0) return;
        return this.phoneProvider.verify('+86' + this.phone).then(() => {
            this.waiting = 10;
            const handle = setInterval(() => {
                if (this.waiting > 0) {
                    this.waiting--;
                    this.codeButtonText = this.waiting + 's';
                } else {
                    clearInterval(handle);
                    this.codeButtonText = '获取验证码';
                }
            }, 1000);
        }, (err)=>this.toast.presentError(err));
    }

    // Attempt to login in through our User service
    doLogin() {
        this.loading.present();
        from(this.phoneProvider.login('+86' + this.phone, this.code)).subscribe(() => {
            MeteorObservable.subscribe('myData').subscribe({
                next: () => {
                    this.loading.dismiss();
                    this.navCtrl.setRoot(MainPage);
                },
                error: (err) => {
                    this.loading.dismiss();
                    this.toast.presentError(err);
                },
            });
        }, (err)=>this.toast.presentError(err));
    }
}

function removeCountryCode(phone: string) {
    if (phone.trim().indexOf('+86') != 0) {
        throw new Error('暂不支持中国大陆地区以外的电话号码');
    }
    return phone.substring(3);
}
