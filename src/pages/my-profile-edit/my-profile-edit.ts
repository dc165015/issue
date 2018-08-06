import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { User } from 'api/models/user';
import { PictureProvider } from 'providers/picture/picture';
import { ToastProvider } from 'providers/toast/toast';
import { MeteorObservable } from 'meteor-rxjs';
import { UsernameValidator } from './username.validator';
import { Picture } from 'api/models/picture';
import { MIN_MYNAME_LENGTH, MAX_MYNAME_LENGTH, MAX_MYDESCRIPTION_LENGTH } from 'api/lib/constants';
import { PreloadImage } from 'components/preload-image/preload-image';

@Component({
    selector: 'page-my-profile-edit',
    templateUrl: 'my-profile-edit.html',
})
export class MyProfileEditPage implements OnInit {
    settingsForm: FormGroup;
    user: User;
    @ViewChild(PreloadImage) avatar: PreloadImage;

    constructor(
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public navParams: NavParams,
        public pictureProvider: PictureProvider,
        public toast: ToastProvider,
    ) {
        this.settingsForm = new FormGroup({
            name: new FormControl(
                '',
                Validators.compose([
                    UsernameValidator.forbiddenName,
                    Validators.minLength(MIN_MYNAME_LENGTH),
                    Validators.maxLength(MAX_MYNAME_LENGTH),
                    Validators.required,
                    Validators.pattern(/^[^\s][a-zA-Z0-9_\s\u4e00-\u9fa5]*[^\s]$/),
                ]),
            ),
            description: new FormControl('', Validators.maxLength(MAX_MYDESCRIPTION_LENGTH)),
        });
    }

    ngOnInit() {
        MeteorObservable.autorun().subscribe(() => {
            this.user = Meteor.user() as User;
            this.pathValue();
        });
    }

    pathValue() {
        this.settingsForm.patchValue({
            name: this.user.profile.name,
            description: this.user.profile.description,
        });
    }

    selectProfilePicture(): void {
        this.pictureProvider
            .getPicture(false, true)
            .then((blob) => {
                this.uploadProfilePicture(blob);
            })
            .catch((err) => this.toast.presentError(err));
    }

    uploadProfilePicture(blob): void {
        this.pictureProvider
            .upload(blob, {
                for: Picture.FOR.USER_AVATAR,
                beforeAction: () => {
                    this.avatar._loaded(false);
                },
            })
            .then((picture) => {
                MeteorObservable.call('updateProfile', { pictureId: picture._id }).subscribe(() => {
                    this.avatar._loaded(true);
                });
            })
            .catch((err) => this.toast.presentError(err));
    }

    updateProfile() {
        const name = this.settingsForm.get('name').value;
        const description = this.settingsForm.get('description').value;
        MeteorObservable.call('updateProfile', { name, description }).subscribe({
            next: () => {
                this.navCtrl.pop();
            },
            error: (err) => this.toast.presentError(err),
        });
    }

    validation_messages = {
        name: [
            { type: 'required', message: '名字不能空着' },
            { type: 'minlength', message: `最少${MIN_MYNAME_LENGTH}个字` },
            { type: 'maxlength', message: `最多${MAX_MYNAME_LENGTH}个字` },
            { type: 'pattern', message: '只能包含英文字母、数字、汉字、下划线和空格，\n但开头结尾不能有空格' },
            { type: 'forbiddenName', message: '不能含有敏感词' },
        ],
        description: [ { type: 'maxlength', message: `最多${MAX_MYDESCRIPTION_LENGTH}个字` } ],
    };

    save() {
        if (this.settingsForm.valid && this.settingsForm.dirty) this.updateProfile();
    }

    onSubmit() {
        this.save();
    }
}
