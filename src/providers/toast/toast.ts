import { Injectable } from '@angular/core';
import { ToastController, Toast } from 'ionic-angular';

@Injectable()
export class ToastProvider {
    handler: Toast;
    constructor(public toastCtrl: ToastController) {}

    present(msg: string) {
        this.dismiss();

        // const key = msg.toUpperCase().replace(/\s/g, '_');
        this.handler = this.toastCtrl.create({
            message: msg,
            position: 'bottom',
            duration: 5000,
            showCloseButton: true,
        });
        this.handler.present();
    }

    dismiss() {
        if (this.handler) this.handler.dismiss();
    }

    presentError(e: Error | Meteor.Error | string) {
        this.dismiss();

        let msg;
        if (e instanceof Meteor.Error)
            msg = e.details || e.reason || e.error;
        else if (e instanceof Error)
            msg = e.message;
        else msg = e;
        this.present(msg);
    }
}
