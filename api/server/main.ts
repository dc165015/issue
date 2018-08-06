import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Meteor.startup(() => {
  setupSMS();
  if (!Meteor.isProduction) {
    const fixture = require("./fixtures").default;
    fixture();
  }
});

function setupSMS() {
  if (Meteor.settings) {
    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
    // SMS.twilio = Meteor.settings['twilio'];
    (<any>SMS).phoneTemplates = {
      from: '+8613917189885',
      text: function (user, code) {
        return '您的【星空】登录验证码为：' + code;
      },
    };
    // SMS.send = function (options) { }
  }
}
