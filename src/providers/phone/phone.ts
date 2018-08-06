import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Platform } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { SmsReceiver } from '../../ionic/sms-receiver';
import * as Bluebird from 'bluebird';
import { from } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { TWILIO_SMS_NUMBERS } from 'api/lib/constants';

@Injectable()
export class PhoneProvider {
    constructor(private platform: Platform, private sim: Sim, private sms: SmsReceiver) {
        Bluebird.promisifyAll(this.sms);
    }

    async getNumber(): Promise<string> {
        if (!this.platform.is('cordova')) throw new Error('Cannot read SIM, platform is not cordova.');

        if (!await this.sim.hasReadPermission()) {
            try {
                await this.sim.requestReadPermission();
            } catch (e) {
                throw new Error('User denied SIM access');
            }
        }

        return '+' + (await this.sim.getSimInfo()).phoneNumber;
    }

    async getSms(): Promise<string> {
        if (!this.platform.is('android')) {
            throw new Error('Cannot read SMS, platform is not Android.');
        }

        try {
            await (<any>this.sms).isSupported();
        } catch (e) {
            throw new Error('User denied SMS access.');
        }

        const startObs = from((<any>this.sms).startReceiving()).pipe(timeout(60000));

        let msg;
        try {
            msg = await startObs.toPromise();
        } catch (e) {
            await (<any>this.sms).stopReceiving();
            throw e;
        }

        await (<any>this.sms).stopReceiving();

        if (TWILIO_SMS_NUMBERS.includes(msg.split('>')[0])) {
            //TODO: 加入国内短信验证码模板格式截取 @v1
            return msg.substr(msg.length - 4);
        } else {
            throw new Error('Sender is not a Twilio number.');
        }
    }

    verify(phoneNumber: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
                if (e) {
                    return reject(e);
                }

                resolve();
            });
        });
    }

    // FIXME: 如果用户当前手机号以前是归属于其他星空用户的，则登录后会取得原用户所有权限。 @v2
    login(phoneNumber: string, code: string): Promise<void> {
        // TODO: 加入密码验证功能 @v2
        return new Promise<void>((resolve, reject) => {
            Accounts.verifyPhone(phoneNumber, code, (e: Error, loginDetails) => {
                if (e) {
                    return reject(e);
                }

                resolve(loginDetails);
            });
        });
    }

}
