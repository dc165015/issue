import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { AgmCoreModule } from '@agm/core';
import { IonicStorageModule, } from '@ionic/storage';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Items } from '../mocks/providers/items';
import { MyApp } from './app.component';
import { MomentModule } from 'angular2-moment';
import { PhoneProvider } from 'providers/phone/phone';
import { Sim } from '@ionic-native/sim';
import { LocationProvider } from 'providers/location/location';
import { PictureProvider } from 'providers/picture/picture';
import { SmsReceiver } from '../ionic/sms-receiver';
import { ToastProvider } from 'providers/toast/toast';
import { PreloadImage } from 'components/preload-image/preload-image';
import { UserProfilePage } from 'pages/user-profile/user-profile';
import { RatingComponent } from 'components/rating/rating';
import { LoginPage } from 'pages/login/login';
import { HideHeaderDirective } from 'directives/hide-header';
import { SettingsPage } from 'pages/settings/settings';
import { TabsPage } from 'pages/tabs/tabs';
import { ChatsPage } from 'pages/chats/chats';
import { MessagesPage } from 'pages/messages/messages';
import { BookListSlidesPage } from 'pages/book-list-slides/book-list-slides';
import { BookBlockSmallComponent } from 'components/book-block/book-block-small';
import { NewChatComponent } from 'components/new-chat/new-chat';
import { LocationMessageComponent } from 'components/location-message/location-message';
import { MessagesAttachmentsComponent } from 'components/messages-attachments/messages-attachments';
import { BookProfilePage } from 'pages/book-profile/book-profile';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NewCopyPage } from 'pages/new-copy/new-copy';
import { DoubanProvider } from 'providers/book/douban';
import { CopyProvider } from 'providers/copy/copies';
import { MyProfileEditPage } from 'pages/my-profile-edit/my-profile-edit';
import { MyTermsEditPage } from 'pages/my-terms-edit/my-terms-edit';
import { TermsOfServicePage } from 'pages/terms-of-service/terms-of-service';
import { CommunityListSlidesPage } from 'pages/community-list-slides/community-list-slides';
import { UserBlockSmallComponent } from 'components/user-block/user-block-small';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    MyApp,

    // pages
    LoginPage,
    BookListSlidesPage,
    CommunityListSlidesPage,
    UserProfilePage,
    SettingsPage,
    MyProfileEditPage,
    MyTermsEditPage,
    TabsPage,
    ChatsPage,
    MessagesPage,
    BookProfilePage,
    NewCopyPage,
    TermsOfServicePage,

    // Components
    PreloadImage,
    RatingComponent,
    BookBlockSmallComponent,
    UserBlockSmallComponent,
    NewChatComponent,
    LocationMessageComponent,
    MessagesAttachmentsComponent,

    // Directives
    HideHeaderDirective,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MomentModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      iconMode:'ios',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition',
      tabsHideOnSubPages: true,
      mode:'ios'
    }),
    IonicStorageModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA',
    }),
    IonicImageViewerModule
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    MyApp,

    // pages
    LoginPage,
    BookListSlidesPage,
    CommunityListSlidesPage,
    UserProfilePage,
    SettingsPage,
    TabsPage,
    ChatsPage,
    MessagesPage,
    BookProfilePage,
    NewCopyPage,
    MyProfileEditPage,
    MyTermsEditPage,
    TermsOfServicePage,

    // Components
    PreloadImage,
    RatingComponent,
    BookBlockSmallComponent,
    UserBlockSmallComponent,
    NewChatComponent,
    LocationMessageComponent,
    MessagesAttachmentsComponent,

  ],
  providers: [
    Items,
    Camera,
    SplashScreen,
    StatusBar,
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    PhoneProvider,
    Geolocation,
    LocationProvider,
    PictureProvider,
    Sim,
    SmsReceiver,
    Camera,
    Crop,
    ToastProvider,
    BarcodeScanner,
    DoubanProvider,
    CopyProvider,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AppModule {}
