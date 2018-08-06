import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { User } from 'api/models/user';
import { ToastProvider } from 'providers/toast/toast';
import { MeteorObservable } from 'meteor-rxjs';
import { DEFAULT_TERMS, MAX_MYTERMS_LENGTH } from 'api/lib/constants';

@Component({
    selector: 'page-my-terms-edit',
    templateUrl: 'my-terms-edit.html',
})
export class MyTermsEditPage implements OnInit {
    settingsForm: FormGroup;
    user: User;

    constructor(
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public navParams: NavParams,
        public toast: ToastProvider,
    ) {
        this.settingsForm = new FormGroup({
            myTerms: new FormControl('', Validators.maxLength(MAX_MYTERMS_LENGTH)),
        });
    }

    ngOnInit() {
        MeteorObservable.autorun().subscribe(() => {
            this.user = Meteor.user() as User;
            this.settingsForm.patchValue({
                myTerms: this.user.settings.myTerms || DEFAULT_TERMS,
            });
        });
    }

    updateSettings() {
        const myTerms = this.settingsForm.get('myTerms').value;
        MeteorObservable.call('updateSettings', { myTerms }).subscribe({
            next: () => {
                this.navCtrl.pop();
            },
            error: (err) => this.toast.presentError(err),
        });
    }

    save() {
        if (this.settingsForm.valid) this.updateSettings();
    }

    validation_messages = {
        myTerms: [ { type: 'maxlength', message: '最多${MAX_MYTERMS_LENGTH}字' } ],
    };
}
