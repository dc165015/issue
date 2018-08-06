import { requireLogin } from "../lib/util";
import { Profile, UserSettings } from "../models/user";

Meteor.methods({
    updateProfile(profile: Profile): void{
        if (!profile) return;
        requireLogin();
        Profile.check(profile);
        let fields;
        for (let key of Object.keys(profile)) {
            fields = fields || {};
            fields[`profile.${key}`] = profile[key];
        }
        Meteor.users.update(this.userId, { $set: fields });
    },

    updateSettings(settings: UserSettings) {
        requireLogin();
        UserSettings.check(settings);
        Meteor.users.update(this.userId, { $set: { settings } });
    }
})
