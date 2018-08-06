import { Component } from '@angular/core';
import { ModalController, ViewController, Platform } from 'ionic-angular';
import { MessageType } from 'api/models/message';
import { LocationMessageComponent } from 'components/location-message/location-message';
import { PictureProvider } from 'providers/picture/picture';
import { ToastProvider } from 'providers/toast/toast';

@Component({
    selector: 'messages-attachments',
    templateUrl: 'messages-attachments.html',
})
export class MessagesAttachmentsComponent {
    constructor(
        private viewCtrl: ViewController,
        private modelCtrl: ModalController,
        private pictureProvider: PictureProvider,
        public toast: ToastProvider,
        private platform: Platform,
    ) {}

    sendLocation(): void {
        const locationModal = this.modelCtrl.create(LocationMessageComponent);
        locationModal.onDidDismiss((location) => {
            if (!location) {
                this.viewCtrl.dismiss();
                return;
            }

            this.viewCtrl.dismiss({
                messageType: MessageType.LOCATION,
                selectedLocation: location,
            });
        });

        locationModal.present();
    }

    sendPicture(camera: boolean): void {
        if (camera && !this.platform.is('cordova')) {
            return console.warn('只有Cordova平台才可拍照');
        }

        this.pictureProvider.getPicture(camera, false).then((file: File) => {
            this.viewCtrl.dismiss({
                messageType: MessageType.PICTURE,
                selectedPicture: file,
            });
        }, (err)=>this.toast.presentError(err));
    }
}
