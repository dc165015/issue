import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Nav, Platform } from 'ionic-angular';
import { Meteor } from 'meteor/meteor';
import { FirstRunPage, MainPage } from '../pages';
import { LoginPage } from 'pages/login/login';
import { TabsPage } from 'pages/tabs/tabs';
import { SettingsPage } from 'pages/settings/settings';
import { SearchPage } from 'pages/search/search';
import { BookListSlidesPage } from 'pages/book-list-slides/book-list-slides';
import { ToastProvider } from 'providers/toast/toast';
import { Observable, of, fromEvent, merge, NEVER } from 'rxjs';
import { mapTo, takeWhile, debounceTime, map, tap } from 'rxjs/operators';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
    templateUrl: './app.html',
})
export class MyApp {
    rootPage: any = FirstRunPage;
    online$: Observable<any>;
    @ViewChild(Nav) nav: Nav;

    pages: any[] = [
        { title: 'Tabs', component: TabsPage },
        { title: 'Login', component: LoginPage },
        { title: 'Settings', component: SettingsPage },
        { title: 'Search', component: SearchPage },
        { title: 'Books', component: BookListSlidesPage },
    ];

    constructor(
        platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        public toast: ToastProvider,
    ) {
        this.rootPage = Meteor.user() ? MainPage : LoginPage;

        platform.ready().then(() => {
            if (platform.is('cordova')) {
                this.statusBar.styleDefault();
                this.splashScreen.hide();
            }
        });

        monitorMeteorConnection.call(this);
    }

    openPage(page) {
        this.nav.setRoot(page.component);
    }
}

function monitorMeteorConnection() {
    if (!Meteor.status().connected) {
        if (!navigator.onLine) {
            this.toast.present(`网络断了，请检查...`);
        } else {
            const status = Meteor.status();
            const count = status.retryCount;
            if (status.status == 'connecting' && count >= 1) {
                this.toast.present(`正在尝试第${count}次连接服务器......`);
            }
        }
    } else {
        this.toast.dismiss();
    }
}
